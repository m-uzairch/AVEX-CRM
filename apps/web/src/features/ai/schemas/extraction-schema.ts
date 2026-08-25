import { z } from 'zod';

export const textGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().int().positive().optional().default(1000),
});

export type TextGenerationFormValues = z.infer<typeof textGenerationSchema>;

export const rawDocumentInputSchema = z.object({
  content: z.string().min(2, 'Document text or raw content is required'),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  instructions: z.string().optional(),
});

export type RawDocumentInput = z.infer<typeof rawDocumentInputSchema>;
