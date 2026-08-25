import { z } from 'zod';

export const extractedLeadItemSchema = z.object({
  name: z.string().min(1, 'Lead contact name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  expectedDealValue: z.number().nonnegative().optional().default(0),
  source: z.string().optional().default('AI Extraction'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  tags: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1).default(0.85),
});

export const leadExtractionResultSchema = z.object({
  leads: z.array(extractedLeadItemSchema),
  totalExtracted: z.number().int().nonnegative(),
  extractionSummary: z.string().optional(),
});

export type ExtractedLeadItem = z.infer<typeof extractedLeadItemSchema>;
export type LeadExtractionResult = z.infer<typeof leadExtractionResultSchema>;
