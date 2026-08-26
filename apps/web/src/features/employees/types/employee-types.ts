export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface EmployeeUser {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  status: string;
}

export interface EmployeeRecord {
  id: string;
  companyId: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  department: string | null;
  employmentStatus: EmploymentStatus;
  hireDate: string | null;
  terminationDate: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user?: EmployeeUser | null;
}

export interface EmployeeFilterParams {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeAssignedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

export interface EmployeeAttendanceSummary {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  totalWorkingHours: number;
  recentRecords: {
    id: string;
    date: string;
    clockIn: string | null;
    clockOut: string | null;
    status: string;
    workingMinutes: number;
  }[];
}

export interface EmployeeDetailResponse {
  employee: EmployeeRecord;
  assignedTasks: EmployeeAssignedTask[];
  attendanceSummary: EmployeeAttendanceSummary;
}

export interface PaginatedEmployeesResponse {
  data: EmployeeRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
