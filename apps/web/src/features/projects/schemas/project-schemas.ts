import { z } from 'zod';

export const projectStatusEnum = z.enum([
  'PLANNING',
  'PENDING',
  'IN_PROGRESS',
  'ON_HOLD',
  'REVIEW',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED',
]);

export const projectPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const projectMemberRoleEnum = z.enum(['PROJECT_MANAGER', 'MEMBER', 'VIEWER']);

export const businessTypeEnum = z.enum(['PHYSICAL', 'DIGITAL']);

export const projectMilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required'),
  description: z.string().optional().nullable(),
  order: z.number().default(0),
  dueDate: z.string().optional().nullable(),
});

export const projectFormSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  projectManagerId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  status: projectStatusEnum.default('PLANNING'),
  priority: projectPriorityEnum.default('MEDIUM'),
  businessType: z.string().optional().nullable(),
  currency: z.string().default('USD'),
  templateId: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  expectedCompletionDate: z.string().optional().nullable(),
  budget: z.number().nonnegative().optional().nullable(),
  isArchived: z.boolean().optional(),
  memberIds: z.array(z.string()).optional(),
  milestones: z.array(projectMilestoneSchema).optional(),
});

export const projectCategoryFormSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  color: z.string().default('#3B82F6'),
});

export const projectMemberFormSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: projectMemberRoleEnum.default('MEMBER'),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type ProjectCategoryFormValues = z.infer<typeof projectCategoryFormSchema>;
export type ProjectMemberFormValues = z.infer<typeof projectMemberFormSchema>;
