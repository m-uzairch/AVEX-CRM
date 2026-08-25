import { UserRole } from '@/features/rbac/types/rbac-types';

export interface UserProfileSettings {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  bio?: string;
  avatar?: string;
  role: UserRole;
  companyName: string;
}

export interface AccountSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  defaultCurrency: string;
}

export interface CompanySettings {
  id: string;
  name: string;
  legalName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  logoUrl?: string;
  taxNumber?: string;
  defaultCurrency: string;
  businessType: 'DIGITAL' | 'PHYSICAL' | 'BOTH';
  timezone: string;
}

export interface NotificationChannelPreferences {
  inApp: boolean;
  email: boolean;
}

export interface NotificationPreferences {
  newLead: NotificationChannelPreferences;
  leadAssignment: NotificationChannelPreferences;
  customerUpdates: NotificationChannelPreferences;
  taskAssignment: NotificationChannelPreferences;
  projectUpdates: NotificationChannelPreferences;
  invoiceEvents: NotificationChannelPreferences;
  paymentEvents: NotificationChannelPreferences;
  clientRequests: NotificationChannelPreferences;
  clientMessages: NotificationChannelPreferences;
  meetings: NotificationChannelPreferences;
  attendanceEvents: NotificationChannelPreferences;
}

export interface EmailSettingsConfig {
  provider: string;
  senderName: string;
  senderEmail: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONFIGURED';
  isConfigured: boolean;
  maskedKeyNotice: string;
}

export interface CalendarSettings {
  defaultView: 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA';
  weekStartDay: 'SUNDAY' | 'MONDAY';
  timezone: string;
  workingHoursStart: string; // e.g. "09:00"
  workingHoursEnd: string;   // e.g. "18:00"
  defaultEventDuration: number; // minutes: 15, 30, 45, 60
  meetingReminders: number; // minutes before: 5, 10, 15, 30, 60
}

export interface SecuritySession {
  id: string;
  deviceIp: string;
  userAgent: string;
  browser: string;
  os: string;
  isCurrent: boolean;
  lastActivity: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessions: SecuritySession[];
}

export interface CRMPreferences {
  defaultCustomerView: 'TABLE' | 'CARDS';
  defaultLeadView: 'KANBAN' | 'LIST';
  defaultPipelineView: 'STAGE_COLUMNS' | 'METRICS_TABLE';
  defaultInvoiceCurrency: string;
  defaultQuotationCurrency: string;
  defaultPageSize: number; // 10, 25, 50, 100
  numberFormat: 'STANDARD' | 'COMPACT';
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
}

export type SettingsTab =
  | 'profile'
  | 'account'
  | 'company'
  | 'users'
  | 'notifications'
  | 'email'
  | 'calendar'
  | 'security'
  | 'crm';
