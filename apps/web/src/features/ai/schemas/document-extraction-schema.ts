import { z } from 'zod';

export const extractedDeadlineItemSchema = z.object({
  id: z.string().default(() => `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
  title: z.string().min(1, 'Deadline or event title is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Valid ISO date format required'),
  type: z.enum(['DEADLINE', 'PROJECT_START', 'MILESTONE', 'TASK_DUE']).default('DEADLINE'),
  description: z.string().optional(),
  relatedEntity: z.string().optional(),
  syncToCalendar: z.boolean().default(true),
});

export type ExtractedDeadlineItem = z.infer<typeof extractedDeadlineItemSchema>;

export const documentExtractionPreviewItemSchema = z.object({
  id: z.string(),
  data: z.record(z.any()),
  entityType: z.enum(['LEAD', 'CUSTOMER']),
  isValid: z.boolean(),
  validationIssues: z.array(z.string()).default([]),
  isDuplicate: z.boolean(),
  duplicateReason: z.string().optional(),
  duplicateMatchId: z.string().optional(),
  duplicateStrategy: z.enum(['SKIP', 'UPDATE', 'CREATE_NEW']).default('SKIP'),
});

export type DocumentExtractionPreviewItem = z.infer<typeof documentExtractionPreviewItemSchema>;

export const confirmDocumentImportSchema = z.object({
  targetEntity: z.enum(['LEAD', 'CUSTOMER']),
  items: z.array(documentExtractionPreviewItemSchema),
  deadlinesToSync: z.array(extractedDeadlineItemSchema).optional().default([]),
});

export type ConfirmDocumentImportRequest = z.infer<typeof confirmDocumentImportSchema>;
