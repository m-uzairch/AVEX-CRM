export type UserRole = 'COMPANY_OWNER' | 'ADMIN' | 'EMPLOYEE' | 'CLIENT';

export type Permission =
  | 'MANAGE_COMPANY'
  | 'MANAGE_USERS'
  | 'MANAGE_CRM'
  | 'MANAGE_PROJECTS'
  | 'MANAGE_EMPLOYEES'
  | 'MANAGE_ATTENDANCE'
  | 'MANAGE_INVOICES'
  | 'MANAGE_INVENTORY'
  | 'MANAGE_REPORTS'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_BILLING'
  | 'VIEW_CLIENT_PORTAL';

export interface UserManagementRecord {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  avatarUrl?: string;
  createdAt: string;
}

export interface UserInvitationInput {
  fullName: string;
  email: string;
  role: UserRole;
  password?: string;
}
