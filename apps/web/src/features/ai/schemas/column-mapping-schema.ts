import { z } from 'zod';

export const columnMappingItemSchema = z.object({
  sourceColumn: z.string().min(1, 'Source column name is required'),
  targetField: z.string().min(1, 'Target field key is required'),
  confidence: z.number().min(0).max(1).default(0.9),
  reasoning: z.string().optional(),
});

export const columnMappingRequestSchema = z.object({
  headers: z.array(z.string()).min(1, 'At least one header column is required'),
  targetEntity: z.enum(['LEAD', 'CUSTOMER', 'INVOICE', 'EXPENSE']).default('LEAD'),
  sampleRows: z.array(z.record(z.any())).optional(),
});

export const columnMappingResultSchema = z.object({
  mappings: z.array(columnMappingItemSchema),
  unmappedColumns: z.array(z.string()).default([]),
  targetEntity: z.string(),
});

export type ColumnMappingItem = z.infer<typeof columnMappingItemSchema>;
export type ColumnMappingRequest = z.infer<typeof columnMappingRequestSchema>;
export type ColumnMappingResponse = z.infer<typeof columnMappingResultSchema>;
