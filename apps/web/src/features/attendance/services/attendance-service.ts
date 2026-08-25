import {
  AttendanceRecord,
  AttendanceFilterOptions,
  AttendanceKPIs,
  ShiftConfig,
  TeamMemberAttendance,
} from '../types/attendance-types';
import {
  ClockInFormValues,
  ClockOutFormValues,
  AttendanceAdjustFormValues,
} from '../schemas/attendance-schemas';

export const DEFAULT_SHIFT_CONFIG: ShiftConfig = {
  shiftStart: '09:00',
  shiftEnd: '18:00',
  gracePeriodMinutes: 15,
  halfDayThresholdHours: 4.5,
  standardWorkingHours: 8.0,
};

export class AttendanceService {
  /**
   * Fetch authenticated user's today attendance status
   */
  static async getTodayAttendance(): Promise<{
    record: AttendanceRecord | null;
    shiftConfig: ShiftConfig;
    isClockedIn: boolean;
    isClockedOut: boolean;
  }> {
    const res = await fetch('/api/attendance/today');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch today attendance');
    }
    return res.json();
  }

  /**
   * Clock in for today
   */
  static async clockIn(values: ClockInFormValues = {}): Promise<{
    record: AttendanceRecord;
    message: string;
  }> {
    const res = await fetch('/api/attendance/clock-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to clock in');
    }
    return res.json();
  }

  /**
   * Clock out for today
   */
  static async clockOut(values: ClockOutFormValues = {}): Promise<{
    record: AttendanceRecord;
    message: string;
  }> {
    const res = await fetch('/api/attendance/clock-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to clock out');
    }
    return res.json();
  }

  /**
   * Fetch attendance history (personal or company-wide)
   */
  static async getHistory(filters: AttendanceFilterOptions = {}): Promise<{
    records: AttendanceRecord[];
    summary: {
      totalDays: number;
      presentDays: number;
      lateDays: number;
      halfDays: number;
      totalWorkingHours: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.userId) params.set('userId', filters.userId);

    const res = await fetch(`/api/attendance/history?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch attendance history');
    }
    return res.json();
  }

  /**
   * Fetch team daily attendance roster and presence KPIs (Admin/Owner)
   */
  static async getTeamAttendance(date?: string): Promise<{
    team: TeamMemberAttendance[];
    kpis: AttendanceKPIs;
    date: string;
  }> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);

    const res = await fetch(`/api/attendance/team?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch team attendance');
    }
    return res.json();
  }

  /**
   * Admin manual adjustment / regularization
   */
  static async adjustAttendance(values: AttendanceAdjustFormValues): Promise<{
    record: AttendanceRecord;
    message: string;
  }> {
    const res = await fetch('/api/attendance/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to adjust attendance record');
    }
    return res.json();
  }

  /**
   * Helper to format minutes into "Xh Ym"
   */
  static formatMinutes(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  }
}
