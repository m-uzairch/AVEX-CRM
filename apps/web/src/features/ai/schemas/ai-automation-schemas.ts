import { z } from 'zod';

export type AutomationTriggerType =
  | 'LEAD_INACTIVE'
  | 'QUOTATION_PENDING'
  | 'INVOICE_OVERDUE'
  | 'PROJECT_DEADLINE_NEAR'
  | 'TASK_OVERDUE'
  | 'CUSTOMER_INACTIVITY';

export type AutomationActionType =
  | 'SEND_EMAIL_REMINDER'
  | 'CREATE_CALENDAR_TASK'
  | 'DISPATCH_NOTIFICATION'
  | 'SCHEDULE_FOLLOW_UP';

export interface AIPreparedPayload {
  recipientEmail?: string;
  recipientName?: string;
  subject?: string;
  emailBody?: string;
  calendarTitle?: string;
  calendarDate?: string;
  notificationMessage?: string;
  deepLinkUrl?: string;
}

export interface AIAutomationItem {
  id: string;
  companyId: string;
  triggerType: AutomationTriggerType;
  actionType: AutomationActionType;
  title: string;
  description: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  entityId: string;
  entityType: 'LEAD' | 'QUOTATION' | 'INVOICE' | 'PROJECT' | 'TASK' | 'CUSTOMER';
  status: 'PENDING_APPROVAL' | 'EXECUTED' | 'DISMISSED';
  preparedPayload: AIPreparedPayload;
  createdAt: string;
  executedAt?: string;
}

export interface AutomationSummaryKPIs {
  pendingCount: number;
  executedCount: number;
  dismissedCount: number;
  highUrgencyCount: number;
}

export const executeAutomationSchema = z.object({
  customSubject: z.string().optional(),
  customBody: z.string().optional(),
  calendarDate: z.string().optional(),
  overrideNotification: z.string().optional(),
});

export type ExecuteAutomationPayload = z.infer<typeof executeAutomationSchema>;
