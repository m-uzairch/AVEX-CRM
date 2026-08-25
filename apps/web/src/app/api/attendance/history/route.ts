/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { memoryAttendanceRecords } from '@/features/attendance/services/attendance-store';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get('search') || '').toLowerCase();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const requestedUserId = searchParams.get('userId');

    const list = memoryAttendanceRecords[auth.companyId] || memoryAttendanceRecords.comp_001 || [];

    // Filter by user role: EMPLOYEE only sees their own; ADMIN/OWNER can see all in company
    let filtered = list.filter((r) => {
      if (auth.role === 'EMPLOYEE') {
        return r.userId === auth.userId && r.companyId === auth.companyId;
      }
      return r.companyId === auth.companyId;
    });

    if (requestedUserId && auth.role !== 'EMPLOYEE') {
      filtered = filtered.filter((r) => r.userId === requestedUserId);
    }

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(search) ||
          r.employeeEmail.toLowerCase().includes(search) ||
          (r.notes && r.notes.toLowerCase().includes(search))
      );
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === status);
    }

    if (startDate) {
      filtered = filtered.filter((r) => r.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((r) => r.date <= endDate);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate personal / group summary
    const presentDays = filtered.filter((r) => r.status === 'PRESENT').length;
    const lateDays = filtered.filter((r) => r.status === 'LATE').length;
    const halfDays = filtered.filter((r) => r.status === 'HALF_DAY').length;
    const totalWorkingMinutes = filtered.reduce((acc, r) => acc + (r.workingMinutes || 0), 0);
    const totalWorkingHours = Math.round((totalWorkingMinutes / 60) * 10) / 10;

    return NextResponse.json({
      records: filtered,
      summary: {
        totalDays: filtered.length,
        presentDays,
        lateDays,
        halfDays,
        totalWorkingHours,
      },
    });
  } catch (error) {
    console.error('[API GET /api/attendance/history] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance history.' }, { status: 500 });
  }
}
