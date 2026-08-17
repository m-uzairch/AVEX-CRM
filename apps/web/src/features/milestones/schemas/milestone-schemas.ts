import { z } from 'zod';

export const milestoneStatusEnum = z.enum([
  'NOT_STARTED',
  'PLANNING',
  'IN_PROGRESS',
  'UNDER_REVIEW',
  'COMPLETED',
  'DELAYED',
  'CANCELLED',
]);

export const milestonePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const milestoneFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: milestoneStatusEnum.default('NOT_STARTED'),
  priority: milestonePriorityEnum.default('MEDIUM'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
  estimatedHours: z.number().optional(),
  budgetAllocation: z.number().optional(),
});

export const milestoneProgressSchema = z.object({
  progressPercentage: z.number().min(0).max(100),
  status: milestoneStatusEnum.optional(),
});

export type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;
export type MilestoneProgressValues = z.infer<typeof milestoneProgressSchema>;
