import { z } from 'zod';

export const dispatchNotificationSchema = z.object({
  type: z.enum([
    'LEAD_CREATED',
    'LEAD_ASSIGNED',
    'CUSTOMER_CREATED',
    'CUSTOMER_UPDATED',
    'TASK_ASSIGNED',
    'TASK_DUE',
    'PROJECT_UPDATED',
    'PROJECT_STATUS_CHANGED',
    'INVOICE_CREATED',
    'INVOICE_DUE',
    'PAYMENT_RECEIVED',
    'QUOTATION_CREATED',
    'QUOTATION_ACCEPTED',
    'QUOTATION_REJECTED',
    'CLIENT_REQUEST_CREATED',
    'CLIENT_MESSAGE_RECEIVED',
    'MEETING_CREATED',
    'MEETING_UPDATED',
    'MEETING_REMINDER',
    'ATTENDANCE_REMINDER',
    'ATTENDANCE_UPDATED',
  ]),
  category: z.enum(['CRM', 'PROJECTS', 'FINANCE', 'PORTAL', 'COMMUNICATION', 'ATTENDANCE', 'SYSTEM']).default('SYSTEM'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  title: z.string().min(2, 'Title is required').max(150),
  message: z.string().min(2, 'Message is required').max(1000),
  link: z.string().max(300).optional().or(z.literal('')),
  entityType: z.string().max(50).optional().or(z.literal('')),
  entityId: z.string().max(100).optional().or(z.literal('')),
  targetUserId: z.string().optional().or(z.literal('')),
});

export type DispatchNotificationValues = z.infer<typeof dispatchNotificationSchema>;

export const notificationFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  unreadOnly: z.boolean().optional(),
  type: z.string().optional(),
});
