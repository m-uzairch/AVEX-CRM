import { z } from 'zod';

export const messageFormSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(4000),
  replyToId: z.string().optional().nullable(),
});

export const meetingFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  projectId: z.string().optional().nullable(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  timezone: z.string().default('UTC'),
  meetingType: z.enum(['ONLINE', 'IN_PERSON']).default('ONLINE'),
  meetingLink: z.string().optional(),
  linkPlatform: z.string().optional(),
  isClientVisible: z.boolean().default(false),
});

export const announcementFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['COMPANY', 'TEAM', 'PROJECT']).default('COMPANY'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  projectId: z.string().optional().nullable(),
  expiresAt: z.string().optional(),
});

export type MessageFormValues = z.infer<typeof messageFormSchema>;
export type MeetingFormValues = z.infer<typeof meetingFormSchema>;
export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
