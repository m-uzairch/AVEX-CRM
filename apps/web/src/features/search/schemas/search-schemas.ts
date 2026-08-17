import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required.').max(30, 'Tag name must be under 30 characters.'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code.'),
  description: z.string().optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

export const savedFilterSchema = z.object({
  name: z.string().min(1, 'Filter name is required.').max(50, 'Name too long.'),
  module: z.enum(['LEADS', 'CUSTOMERS', 'ALL']).default('ALL'),
  filterConfig: z.record(z.any()),
});

export type SavedFilterInput = z.infer<typeof savedFilterSchema>;

export const bulkTagOperationSchema = z.object({
  entityType: z.enum(['LEAD', 'CUSTOMER']),
  entityIds: z.array(z.string()).min(1, 'Select at least one record.'),
  action: z.enum(['ADD', 'REMOVE', 'REPLACE']),
  tags: z.array(z.string()).min(1, 'Select at least one tag.'),
});

export type BulkTagOperationInput = z.infer<typeof bulkTagOperationSchema>;
