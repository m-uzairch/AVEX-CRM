import { z } from 'zod';

export const taskStatusEnum = z.enum([
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'BLOCKED',
  'COMPLETED',
  'CANCELLED',
]);

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const taskFormSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(150),
  description: z.string().optional().nullable(),
  projectId: z.string().min(1, 'Project is required'),
  customerId: z.string().optional().nullable(),
  status: taskStatusEnum.default('TODO'),
  priority: taskPriorityEnum.default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.number().nonnegative().optional().nullable(),
  labels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
  subtasks: z.array(z.object({
    title: z.string().min(1, 'Subtask title is required'),
    dueDate: z.string().optional().nullable(),
  })).optional(),
});

export const subtaskFormSchema = z.object({
  title: z.string().min(1, 'Subtask title is required'),
  dueDate: z.string().optional().nullable(),
});

export const taskCommentFormSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type SubtaskFormValues = z.infer<typeof subtaskFormSchema>;
export type TaskCommentFormValues = z.infer<typeof taskCommentFormSchema>;
