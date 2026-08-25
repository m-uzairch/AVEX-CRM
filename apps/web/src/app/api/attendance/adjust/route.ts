import { NextResponse, type NextRequest } from 'next/server';
import {
  getSettingsAuthContext,
  settingsForbiddenResponse,
} from '@/features/settings/services/settings-auth-helper';
import { attendanceAdjustSchema } from '@/features/attendance/schemas/attendance-schemas';
import { AttendanceRecord } from '@/features/attendance/types/attendance-types';
import { memoryAttendanceRecords } from '@/features/attendance/services/attendance-store';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);

    if (auth.role === 'EMPLOYEE') {
      return settingsForbiddenResponse('Access denied: Only administrators can adjust attendance records.');
    }

    const body = await request.json();
    const validated = attendanceAdjustSchema.parse(body);

    if (!memoryAttendanceRecords[auth.companyId]) {
      memoryAttendanceRecords[auth.companyId] = [];
    }

    const list = memoryAttendanceRecords[auth.companyId];
    let recordIndex = list.findIndex(
      (r) => r.userId === validated.userId && r.date === validated.date
    );

    const clockInIso = validated.clockInTime
      ? `${validated.date}T${validated.clockInTime}:00.000Z`
      : null;
    const clockOutIso = validated.clockOutTime
      ? `${validated.date}T${validated.clockOutTime}:00.000Z`
      : null;

    let workingMinutes = 0;
    if (clockInIso && clockOutIso) {
      workingMinutes = Math.max(
        0,
        Math.floor((new Date(clockOutIso).getTime() - new Date(clockInIso).getTime()) / 60000)
      );
    }

    let targetRecord: AttendanceRecord;

    if (recordIndex !== -1) {
      targetRecord = {
        ...list[recordIndex],
        clockIn: clockInIso,
        clockOut: clockOutIso,
        status: validated.status,
        workingMinutes,
        notes: validated.notes
          ? `${list[recordIndex].notes ? list[recordIndex].notes + ' | Adjusted: ' : 'Adjusted: '}${validated.notes}`
          : list[recordIndex].notes,
        updatedAt: new Date().toISOString(),
      };
      list[recordIndex] = targetRecord;
    } else {
      targetRecord = {
        id: `att_adj_${Date.now()}`,
        companyId: auth.companyId,
        userId: validated.userId,
        employeeName: 'Team Member',
        employeeEmail: 'employee@avexcrm.com',
        employeeRole: 'EMPLOYEE',
        date: validated.date,
        clockIn: clockInIso,
        clockOut: clockOutIso,
        status: validated.status,
        workingMinutes,
        notes: validated.notes ? `Adjusted: ${validated.notes}` : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.unshift(targetRecord);
    }

    return NextResponse.json({
      record: targetRecord,
      message: 'Attendance record adjusted successfully.',
    });
  } catch (error: any) {
    console.error('[API POST /api/attendance/adjust] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to adjust attendance record.' },
      { status: 400 }
    );
  }
}
