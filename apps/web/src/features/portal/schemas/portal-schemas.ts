import { z } from 'zod';

export const clientLoginFormSchema = z.object({
  email: z.string().email('Please enter a valid client email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const requestTypeEnum = z.enum([
  'CHANGE_REQUEST',
  'BUG_ISSUE',
  'GENERAL_REQUEST',
  'QUESTION',
  'OTHER',
]);

export const changeRequestFormSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title cannot exceed 150 characters'),
  requestType: requestTypeEnum.default('CHANGE_REQUEST'),
  description: z.string().min(10, 'Please describe your request in detail (minimum 10 characters)'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  attachmentUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
});

export const createRequestFormSchema = changeRequestFormSchema;

export const requestResponseFormSchema = z.object({
  content: z.string().min(2, 'Response message must be at least 2 characters'),
  attachmentUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
});

export const clientMessageFormSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').optional().nullable(),
  content: z.string().min(1, 'Message content cannot be empty'),
  attachmentUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
});

export const createConversationFormSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(1, 'Message content cannot be empty'),
  attachmentUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
});

export const fileCategoryEnum = z.enum([
  'DOCUMENTS',
  'DESIGNS',
  'CONTRACTS',
  'REPORTS',
  'INVOICES',
  'QUOTATIONS',
  'OTHER',
]);

export const clientFileUploadSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  name: z.string().min(2, 'File name must be at least 2 characters').max(150),
  category: fileCategoryEnum.default('DOCUMENTS'),
  fileUrl: z.string().url('Please enter a valid file URL (e.g. Google Drive, Dropbox, CDN)'),
  fileSize: z.number().positive().default(1024 * 1024),
  fileType: z.string().default('application/octet-stream'),
});

export const clientProfileFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Valid email is required'),
  password: z.string().optional().nullable(),
});

export const meetingTypeEnum = z.enum(['ONLINE', 'IN_PERSON', 'PHONE_CALL', 'OTHER']);

export const meetingRequestFormSchema = z.object({
  projectId: z.string().optional().nullable(),
  title: z.string().min(3, 'Meeting title must be at least 3 characters'),
  description: z.string().optional().nullable(),
  meetingType: meetingTypeEnum.default('ONLINE'),
  location: z.string().optional().nullable(),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  durationMinutes: z.number().int().min(15).max(180).default(30),
});

export type ClientLoginFormValues = z.infer<typeof clientLoginFormSchema>;
export type ChangeRequestFormValues = z.infer<typeof changeRequestFormSchema>;
export type CreateRequestFormValues = ChangeRequestFormValues;
export type RequestResponseFormValues = z.infer<typeof requestResponseFormSchema>;
export type ClientMessageFormValues = z.infer<typeof clientMessageFormSchema>;
export type CreateConversationFormValues = z.infer<typeof createConversationFormSchema>;
export type ClientFileUploadValues = z.infer<typeof clientFileUploadSchema>;
export type ClientProfileFormValues = z.infer<typeof clientProfileFormSchema>;
export type MeetingRequestFormValues = z.infer<typeof meetingRequestFormSchema>;

