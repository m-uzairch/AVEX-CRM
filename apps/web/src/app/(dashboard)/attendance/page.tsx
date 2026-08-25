'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { ClockCard } from '@/features/attendance/components/clock-card';
import { AttendanceHistoryTable } from '@/features/attendance/components/attendance-history-table';
import { TeamAttendanceBoard } from '@/features/attendance/components/team-attendance-board';
import { AttendanceAdjustDialog } from '@/features/attendance/components/attendance-adjust-dialog';
import { AttendanceService, DEFAULT_SHIFT_CONFIG } from '@/features/attendance/services/attendance-service';
import {
  AttendanceRecord,
  AttendanceStatus,
  ShiftConfig,
  TeamMemberAttendance,
  AttendanceKPIs,
} from '@/features/attendance/types/attendance-types';
import { AttendanceAdjustFormValues } from '@/features/attendance/schemas/attendance-schemas';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useToast } from '@/providers/toast-provider';
import { Loader2, UserCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AttendancePage() {
  const { success, error: toastError } = useToast();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'COMPANY_OWNER';
  const isAdminOrOwner = userRole === 'ADMIN' || userRole === 'COMPANY_OWNER';

  const [activeTab, setActiveTab] = React.useState<'MY_ATTENDANCE' | 'TEAM_ROSTER'>('MY_ATTENDANCE');

  // Personal Today State
  const [todayRecord, setTodayRecord] = React.useState<AttendanceRecord | null>(null);
  const [shiftConfig, setShiftConfig] = React.useState<ShiftConfig>(DEFAULT_SHIFT_CONFIG);
  const [isClockedIn, setIsClockedIn] = React.useState(false);
  const [isClockedOut, setIsClockedOut] = React.useState(false);

  // History State
  const [historyRecords, setHistoryRecords] = React.useState<AttendanceRecord[]>([]);
  const [historySummary, setHistorySummary] = React.useState({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    halfDays: 0,
    totalWorkingHours: 0,
  });
  const [historySearch, setHistorySearch] = React.useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = React.useState<'ALL' | AttendanceStatus>('ALL');

  // Team Roster State
  const [teamRoster, setTeamRoster] = React.useState<TeamMemberAttendance[]>([]);
  const [teamKpis, setTeamKpis] = React.useState<AttendanceKPIs>({
    totalEmployees: 0,
    presentToday: 0,
    currentlyClockedIn: 0,
    lateArrivals: 0,
    absentCount: 0,
    onLeaveCount: 0,
  });
  const [teamSelectedDate, setTeamSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);

  // Adjust Dialog
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [adjustTargetUserId, setAdjustTargetUserId] = React.useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = React.useState(true);

  // Load All Attendance Data
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Load Today status
      const todayData = await AttendanceService.getTodayAttendance();
      setTodayRecord(todayData.record);
      setShiftConfig(todayData.shiftConfig);
      setIsClockedIn(todayData.isClockedIn);
      setIsClockedOut(todayData.isClockedOut);

      // 2. Load History
      const histData = await AttendanceService.getHistory({
        search: historySearch,
        status: historyStatusFilter,
      });
      setHistoryRecords(histData.records);
      setHistorySummary(histData.summary);

      // 3. Load Team if admin
      if (isAdminOrOwner) {
        const teamData = await AttendanceService.getTeamAttendance(teamSelectedDate);
        setTeamRoster(teamData.team);
        setTeamKpis(teamData.kpis);
      }
    } catch (err: any) {
      toastError('Failed to load attendance', err.message || 'Error fetching attendance data.');
    } finally {
      setIsLoading(false);
    }
  }, [historySearch, historyStatusFilter, isAdminOrOwner, teamSelectedDate, toastError]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Clock Actions
  const handleClockIn = async () => {
    try {
      const res = await AttendanceService.clockIn();
      success('Clock In Recorded', res.message);
      await loadData();
    } catch (err: any) {
      toastError('Clock In Failed', err.message || 'Could not record clock in.');
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await AttendanceService.clockOut();
      success('Clock Out Recorded', res.message);
      await loadData();
    } catch (err: any) {
      toastError('Clock Out Failed', err.message || 'Could not record clock out.');
    }
  };

  const handleAdjustSubmit = async (values: AttendanceAdjustFormValues) => {
    const res = await AttendanceService.adjustAttendance(values);
    success('Record Adjusted', res.message);
    await loadData();
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Attendance & Shifts Hub"
        description="Monitor daily clock-ins, working hours, shift schedules, overtime tracking, and team presence."
        breadcrumbs={[{ label: 'Attendance' }]}
      />

      {/* Role-Based Tab Switcher (Admin / Owner can switch to Team Roster) */}
      {isAdminOrOwner && (
        <div className="flex items-center space-x-2 border-b border-border mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('MY_ATTENDANCE')}
            className={cn(
              'flex items-center space-x-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-colors',
              activeTab === 'MY_ATTENDANCE'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <UserCheck className="h-4 w-4" />
            <span>My Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TEAM_ROSTER')}
            className={cn(
              'flex items-center space-x-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-colors',
              activeTab === 'TEAM_ROSTER'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="h-4 w-4" />
            <span>Team Presence Roster</span>
          </button>
        </div>
      )}

      {/* Main Content Body */}
      {isLoading ? (
        <div className="p-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'MY_ATTENDANCE' ? (
            <>
              {/* Digital Clock Card */}
              <ClockCard
                todayRecord={todayRecord}
                shiftConfig={shiftConfig}
                isClockedIn={isClockedIn}
                isClockedOut={isClockedOut}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
              />

              {/* Personal History Table */}
              <AttendanceHistoryTable
                records={historyRecords}
                summary={historySummary}
                searchQuery={historySearch}
                statusFilter={historyStatusFilter}
                onSearchChange={setHistorySearch}
                onStatusFilterChange={setHistoryStatusFilter}
              />
            </>
          ) : (
            /* Team Presence Board (Admin View) */
            <TeamAttendanceBoard
              team={teamRoster}
              kpis={teamKpis}
              selectedDate={teamSelectedDate}
              onDateChange={setTeamSelectedDate}
              onOpenAdjust={(uid) => {
                setAdjustTargetUserId(uid);
                setIsAdjustOpen(true);
              }}
            />
          )}
        </div>
      )}

      {/* Admin Regularization / Adjustment Dialog */}
      <AttendanceAdjustDialog
        isOpen={isAdjustOpen}
        initialUserId={adjustTargetUserId}
        initialDate={teamSelectedDate}
        onClose={() => {
          setIsAdjustOpen(false);
          setAdjustTargetUserId(undefined);
        }}
        onSubmit={handleAdjustSubmit}
      />
    </ContentContainer>
  );
}
