import { z } from 'zod';

export const userProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().max(30).optional().or(z.literal('')),
  jobTitle: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export const accountSettingsSchema = z.object({
  language: z.string().min(2).max(10),
  timezone: z.string().min(2).max(50),
  dateFormat: z.enum(['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY']),
  timeFormat: z.enum(['12h', '24h']),
  defaultCurrency: z.string().min(3).max(3),
});

export type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;

export const companySettingsSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  legalName: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('Invalid company email address'),
  phone: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  taxNumber: z.string().max(50).optional().or(z.literal('')),
  defaultCurrency: z.string().min(3).max(3),
  businessType: z.enum(['DIGITAL', 'PHYSICAL', 'BOTH']),
  timezone: z.string().min(2).max(50),
});

export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

const channelToggleSchema = z.object({
  inApp: z.boolean(),
  email: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  newLead: channelToggleSchema,
  leadAssignment: channelToggleSchema,
  customerUpdates: channelToggleSchema,
  taskAssignment: channelToggleSchema,
  projectUpdates: channelToggleSchema,
  invoiceEvents: channelToggleSchema,
  paymentEvents: channelToggleSchema,
  clientRequests: channelToggleSchema,
  clientMessages: channelToggleSchema,
  meetings: channelToggleSchema,
  attendanceEvents: channelToggleSchema,
});

export type NotificationPreferencesFormValues = z.infer<typeof notificationPreferencesSchema>;

export const calendarSettingsSchema = z.object({
  defaultView: z.enum(['MONTH', 'WEEK', 'DAY', 'AGENDA']),
  weekStartDay: z.enum(['SUNDAY', 'MONDAY']),
  timezone: z.string().min(2).max(50),
  workingHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  workingHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  defaultEventDuration: z.number().int().min(15).max(240),
  meetingReminders: z.number().int().min(0).max(1440),
});

export type CalendarSettingsFormValues = z.infer<typeof calendarSettingsSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(4, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const crmPreferencesSchema = z.object({
  defaultCustomerView: z.enum(['TABLE', 'CARDS']),
  defaultLeadView: z.enum(['KANBAN', 'LIST']),
  defaultPipelineView: z.enum(['STAGE_COLUMNS', 'METRICS_TABLE']),
  defaultInvoiceCurrency: z.string().min(3).max(3),
  defaultQuotationCurrency: z.string().min(3).max(3),
  defaultPageSize: z.number().int().min(5).max(100),
  numberFormat: z.enum(['STANDARD', 'COMPACT']),
  dateFormat: z.enum(['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY']),
});

export type CRMPreferencesFormValues = z.infer<typeof crmPreferencesSchema>;

export const testEmailSchema = z.object({
  recipientEmail: z.string().email('Invalid recipient email address'),
});

export type TestEmailFormValues = z.infer<typeof testEmailSchema>;
