/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { clockInSchema } from '@/features/attendance/schemas/attendance-schemas';
import { AttendanceRecord, AttendanceStatus } from '@/features/attendance/types/attendance-types';
import { memoryAttendanceRecords } from '@/features/attendance/services/attendance-store';
import { DEFAULT_SHIFT_CONFIG } from '@/features/attendance/services/attendance-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json().catch(() => ({}));
    const validated = clockInSchema.parse(body);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!memoryAttendanceRecords[auth.companyId]) {
      memoryAttendanceRecords[auth.companyId] = [];
    }

    const list = memoryAttendanceRecords[auth.companyId];
    const existing = list.find((r) => r.userId === auth.userId && r.date === todayStr);

    if (existing && existing.clockIn && !existing.clockOut) {
      return NextResponse.json(
        { error: 'You have already clocked in for today.' },
        { status: 400 }
      );
    }

    // Determine LATE vs PRESENT based on shift start + grace period
    const shiftHour = parseInt(DEFAULT_SHIFT_CONFIG.shiftStart.split(':')[0], 10);
    const shiftMin = parseInt(DEFAULT_SHIFT_CONFIG.shiftStart.split(':')[1], 10);
    const graceCutoffMinutes = shiftHour * 60 + shiftMin + DEFAULT_SHIFT_CONFIG.gracePeriodMinutes;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const status: AttendanceStatus = currentMinutes > graceCutoffMinutes ? 'LATE' : 'PRESENT';

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      companyId: auth.companyId,
      userId: auth.userId,
      employeeName: auth.fullName,
      employeeEmail: auth.email,
      employeeRole: auth.role,
      date: todayStr,
      clockIn: now.toISOString(),
      clockOut: null,
      status,
      workingMinutes: 0,
      notes: validated.notes || undefined,
      device: validated.device || 'Web Browser',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    list.unshift(newRecord);

    // Activity Log
    try {
      const db = prisma as any;
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId: auth.companyId,
            action: 'ATTENDANCE_CHECKED_IN',
            module: 'ATTENDANCE',
            category: 'EMPLOYEES',
            entityType: 'USER',
            entityId: auth.userId,
            description: `${auth.fullName} clocked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Status: ${status})`,
          },
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json(
      {
        record: newRecord,
        message: `Clocked in successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/attendance/clock-in] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to clock in.' },
      { status: 400 }
    );
  }
}
