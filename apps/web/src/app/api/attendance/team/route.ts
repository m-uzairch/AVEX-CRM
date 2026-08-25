/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getSettingsAuthContext,
  settingsForbiddenResponse,
} from '@/features/settings/services/settings-auth-helper';
import { memoryAttendanceRecords } from '@/features/attendance/services/attendance-store';
import { TeamMemberAttendance, AttendanceKPIs } from '@/features/attendance/types/attendance-types';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);

    // Only Admin or Company Owner can view full team roster
    if (auth.role === 'EMPLOYEE') {
      return settingsForbiddenResponse('Access denied: Only administrators can view the team attendance roster.');
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = prisma as any;
    let companyUsers: any[] = [];

    try {
      if (db.user?.findMany) {
        companyUsers = await db.user.findMany({
          where: { companyId: auth.companyId },
          select: { id: true, fullName: true, email: true, avatar: true },
        });
      }
    } catch {
      // Memory fallback
    }

    if (companyUsers.length === 0) {
      companyUsers = [
        { id: 'usr_001', fullName: 'Alex Carter', email: 'admin@avexcrm.com', avatar: undefined },
        { id: 'usr_002', fullName: 'Sarah Jenkins', email: 'sarah@avexcrm.com', avatar: undefined },
        { id: 'usr_003', fullName: 'Marcus Vance', email: 'marcus@avexcrm.com', avatar: undefined },
        { id: 'usr_004', fullName: 'Elena Rostova', email: 'elena@avexcrm.com', avatar: undefined },
        { id: 'usr_005', fullName: 'Liam Chen', email: 'liam@avexcrm.com', avatar: undefined },
      ];
    }

    const records = memoryAttendanceRecords[auth.companyId] || memoryAttendanceRecords.comp_001 || [];
    const dateRecords = records.filter((r) => r.date === date);

    const team: TeamMemberAttendance[] = companyUsers.map((u) => {
      const record = dateRecords.find((r) => r.userId === u.id) || null;

      let currentStatus: TeamMemberAttendance['currentStatus'] = 'NOT_CLOCKED_IN';
      let workingMinutes = 0;

      if (record) {
        if (record.status === 'ON_LEAVE') {
          currentStatus = 'ON_LEAVE';
        } else if (record.clockIn && !record.clockOut) {
          currentStatus = 'CLOCKED_IN';
          const startMs = new Date(record.clockIn).getTime();
          workingMinutes = Math.max(0, Math.floor((Date.now() - startMs) / 60000));
        } else if (record.clockIn && record.clockOut) {
          currentStatus = 'CLOCKED_OUT';
          workingMinutes = record.workingMinutes;
        }
      }

      return {
        userId: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.id === 'usr_001' ? 'COMPANY_OWNER' : u.id === 'usr_002' ? 'ADMIN' : 'EMPLOYEE',
        avatar: u.avatar,
        todayRecord: record,
        currentStatus,
        clockInTime: record?.clockIn || null,
        clockOutTime: record?.clockOut || null,
        workingMinutes,
      };
    });

    const kpis: AttendanceKPIs = {
      totalEmployees: team.length,
      presentToday: team.filter((t) => t.todayRecord && (t.todayRecord.status === 'PRESENT' || t.todayRecord.status === 'LATE' || t.todayRecord.status === 'HALF_DAY')).length,
      currentlyClockedIn: team.filter((t) => t.currentStatus === 'CLOCKED_IN').length,
      lateArrivals: team.filter((t) => t.todayRecord?.status === 'LATE').length,
      absentCount: team.filter((t) => t.currentStatus === 'NOT_CLOCKED_IN').length,
      onLeaveCount: team.filter((t) => t.currentStatus === 'ON_LEAVE').length,
    };

    return NextResponse.json({
      team,
      kpis,
      date,
    });
  } catch (error) {
    console.error('[API GET /api/attendance/team] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch team attendance.' }, { status: 500 });
  }
}
