import { z } from 'zod';

export const calendarEventFormSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(150),
    description: z.string().max(1000).optional().or(z.literal('')),
    eventType: z.enum([
      'MEETING',
      'CLIENT_MEETING',
      'PROJECT_DEADLINE',
      'MILESTONE',
      'TASK',
      'FOLLOW_UP',
      'REMINDER',
      'EVENT',
    ]),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
    startDate: z.string().min(1, 'Start date is required'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time (HH:MM)'),
    endDate: z.string().min(1, 'End date is required'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time (HH:MM)'),
    allDay: z.boolean().default(false),
    location: z.string().max(200).optional().or(z.literal('')),
    meetingLink: z.string().url('Invalid meeting URL').optional().or(z.literal('')),
    linkPlatform: z.string().max(50).optional().or(z.literal('')),
    isClientVisible: z.boolean().default(false),
    projectId: z.string().optional().or(z.literal('')),
    customerId: z.string().optional().or(z.literal('')),
    reminderMinutes: z.number().int().min(0).max(1440).default(15),
  })
  .refine(
    (data) => {
      if (data.allDay) return true;
      const start = new Date(`${data.startDate}T${data.startTime}:00`);
      const end = new Date(`${data.endDate}T${data.endTime}:00`);
      return end >= start;
    },
    {
      message: 'End time must not occur before start time',
      path: ['endTime'],
    }
  );

export type CalendarEventFormValues = z.infer<typeof calendarEventFormSchema>;

export const quickEventSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  startDate: z.string().min(1, 'Date is required'),
  startTime: z.string().default('09:00'),
  endTime: z.string().default('10:00'),
  eventType: z.enum(['MEETING', 'TASK', 'FOLLOW_UP', 'REMINDER']).default('MEETING'),
});

export type QuickEventFormValues = z.infer<typeof quickEventSchema>;
