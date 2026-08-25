import { z } from 'zod';

export const extractedCustomerItemSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  companyName: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  billingAddress: z.string().optional().or(z.literal('')),
  shippingAddress: z.string().optional().or(z.literal('')),
  taxNumber: z.string().optional().or(z.literal('')),
  currency: z.string().default('USD'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).default('ACTIVE'),
  notes: z.string().optional().or(z.literal('')),
  confidenceScore: z.number().min(0).max(1).default(0.85),
});

export const customerExtractionResultSchema = z.object({
  customers: z.array(extractedCustomerItemSchema),
  totalExtracted: z.number().int().nonnegative(),
  extractionSummary: z.string().optional(),
});

export type ExtractedCustomerItem = z.infer<typeof extractedCustomerItemSchema>;
export type CustomerExtractionResult = z.infer<typeof customerExtractionResultSchema>;
