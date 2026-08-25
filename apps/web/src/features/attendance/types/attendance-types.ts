export type AttendanceStatus =
  | 'PRESENT'   // On time
  | 'LATE'      // Clocked in after grace period
  | 'HALF_DAY'  // Worked less than half-day threshold
  | 'ABSENT'    // Did not clock in
  | 'ON_LEAVE'; // Approved leave

export interface ShiftConfig {
  shiftStart: string;         // e.g. "09:00"
  shiftEnd: string;           // e.g. "18:00"
  gracePeriodMinutes: number; // e.g. 15 minutes (clock-in after 09:15 is LATE)
  halfDayThresholdHours: number; // e.g. 4.5 hours
  standardWorkingHours: number; // e.g. 8.0 hours
}

export interface AttendanceRecord {
  id: string;
  companyId: string;
  userId: string;
  employeeName: string;
  employeeEmail: string;
  employeeRole: string;
  avatar?: string;
  date: string;               // YYYY-MM-DD
  clockIn: string | null;     // ISO date string
  clockOut: string | null;    // ISO date string
  status: AttendanceStatus;
  workingMinutes: number;     // Elapsed or total working time
  ipAddress?: string;
  device?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberAttendance {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  todayRecord: AttendanceRecord | null;
  currentStatus: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'NOT_CLOCKED_IN' | 'ON_LEAVE';
  clockInTime: string | null;
  clockOutTime: string | null;
  workingMinutes: number;
}

export interface AttendanceKPIs {
  totalEmployees: number;
  presentToday: number;
  currentlyClockedIn: number;
  lateArrivals: number;
  absentCount: number;
  onLeaveCount: number;
}

export interface AttendanceFilterOptions {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ALL' | AttendanceStatus;
  userId?: string;
}
