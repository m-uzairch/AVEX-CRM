export type NotificationType =
  | 'LEAD_CREATED'
  | 'LEAD_ASSIGNED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_UPDATED'
  | 'TASK_ASSIGNED'
  | 'TASK_DUE'
  | 'PROJECT_UPDATED'
  | 'PROJECT_STATUS_CHANGED'
  | 'INVOICE_CREATED'
  | 'INVOICE_DUE'
  | 'PAYMENT_RECEIVED'
  | 'QUOTATION_CREATED'
  | 'QUOTATION_ACCEPTED'
  | 'QUOTATION_REJECTED'
  | 'CLIENT_REQUEST_CREATED'
  | 'CLIENT_MESSAGE_RECEIVED'
  | 'MEETING_CREATED'
  | 'MEETING_UPDATED'
  | 'MEETING_REMINDER'
  | 'ATTENDANCE_REMINDER'
  | 'ATTENDANCE_UPDATED';

export type NotificationCategory =
  | 'CRM'
  | 'PROJECTS'
  | 'FINANCE'
  | 'PORTAL'
  | 'COMMUNICATION'
  | 'ATTENDANCE'
  | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface CRMNotification {
  id: string;
  companyId: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  readAt?: string | null; // ISO string if read
  createdAt: string;      // ISO string
}

export interface NotificationFilterOptions {
  search?: string;
  category?: 'ALL' | NotificationCategory;
  unreadOnly?: boolean;
  type?: 'ALL' | NotificationType;
}

export interface NotificationKPIs {
  totalCount: number;
  unreadCount: number;
  financeCount: number;
  crmCount: number;
  projectsCount: number;
  meetingsCount: number;
}
