import { z } from 'zod';

export const clockInSchema = z.object({
  notes: z.string().max(300).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  device: z.string().max(100).optional().or(z.literal('')),
});

export type ClockInFormValues = z.infer<typeof clockInSchema>;

export const clockOutSchema = z.object({
  notes: z.string().max(300).optional().or(z.literal('')),
});

export type ClockOutFormValues = z.infer<typeof clockOutSchema>;

export const attendanceAdjustSchema = z.object({
  userId: z.string().min(1, 'Employee ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  clockInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time (HH:MM)').optional().or(z.literal('')),
  clockOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time (HH:MM)').optional().or(z.literal('')),
  status: z.enum(['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE']),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type AttendanceAdjustFormValues = z.infer<typeof attendanceAdjustSchema>;
