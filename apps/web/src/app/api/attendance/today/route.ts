import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { DEFAULT_SHIFT_CONFIG } from '@/features/attendance/services/attendance-service';
import { memoryAttendanceRecords } from '@/features/attendance/services/attendance-store';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const todayStr = new Date().toISOString().split('T')[0];

    const list = memoryAttendanceRecords[auth.companyId] || memoryAttendanceRecords.comp_001 || [];
    const record = list.find((r) => r.userId === auth.userId && r.date === todayStr) || null;

    let workingMinutes = 0;
    let isClockedIn = false;
    let isClockedOut = false;

    if (record) {
      if (record.clockIn && !record.clockOut) {
        isClockedIn = true;
        const startMs = new Date(record.clockIn).getTime();
        workingMinutes = Math.max(0, Math.floor((Date.now() - startMs) / 60000));
      } else if (record.clockIn && record.clockOut) {
        isClockedIn = false;
        isClockedOut = true;
        workingMinutes = record.workingMinutes;
      }
    }

    return NextResponse.json({
      record: record ? { ...record, workingMinutes } : null,
      shiftConfig: DEFAULT_SHIFT_CONFIG,
      isClockedIn,
      isClockedOut,
    });
  } catch (error) {
    console.error('[API GET /api/attendance/today] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch today attendance.' }, { status: 500 });
  }
}
