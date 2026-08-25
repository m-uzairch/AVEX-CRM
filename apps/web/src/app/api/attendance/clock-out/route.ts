/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { clockOutSchema } from '@/features/attendance/schemas/attendance-schemas';
import { memoryAttendanceRecords } from '@/features/attendance/services/attendance-store';
import { DEFAULT_SHIFT_CONFIG, AttendanceService } from '@/features/attendance/services/attendance-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json().catch(() => ({}));
    const validated = clockOutSchema.parse(body);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const list = memoryAttendanceRecords[auth.companyId] || [];
    const index = list.findIndex((r) => r.userId === auth.userId && r.date === todayStr);

    if (index === -1 || !list[index].clockIn) {
      return NextResponse.json(
        { error: 'You have not clocked in for today.' },
        { status: 400 }
      );
    }

    if (list[index].clockOut) {
      return NextResponse.json(
        { error: 'You have already clocked out for today.' },
        { status: 400 }
      );
    }

    const clockInTime = new Date(list[index].clockIn!).getTime();
    const durationMinutes = Math.max(1, Math.floor((now.getTime() - clockInTime) / 60000));

    let finalStatus = list[index].status;
    const halfDayMinutes = DEFAULT_SHIFT_CONFIG.halfDayThresholdHours * 60; // 270 mins

    if (durationMinutes < halfDayMinutes) {
      finalStatus = 'HALF_DAY';
    }

    list[index] = {
      ...list[index],
      clockOut: now.toISOString(),
      workingMinutes: durationMinutes,
      status: finalStatus,
      notes: validated.notes ? `${list[index].notes ? list[index].notes + ' | ' : ''}${validated.notes}` : list[index].notes,
      updatedAt: now.toISOString(),
    };

    const formattedDuration = AttendanceService.formatMinutes(durationMinutes);

    // Activity Log
    try {
      const db = prisma as any;
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId: auth.companyId,
            action: 'ATTENDANCE_CHECKED_OUT',
            module: 'ATTENDANCE',
            category: 'EMPLOYEES',
            entityType: 'USER',
            entityId: auth.userId,
            description: `${auth.fullName} clocked out at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Duration: ${formattedDuration})`,
          },
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({
      record: list[index],
      message: `Clocked out successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Total working time: ${formattedDuration}.`,
    });
  } catch (error: any) {
    console.error('[API POST /api/attendance/clock-out] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to clock out.' },
      { status: 400 }
    );
  }
}
