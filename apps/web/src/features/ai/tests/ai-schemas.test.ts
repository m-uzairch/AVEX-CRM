import { describe, it, expect } from 'vitest';
import { textGenerationSchema, rawDocumentInputSchema } from '../schemas/extraction-schema';
import { leadExtractionResultSchema } from '../schemas/lead-extraction-schema';
import { customerExtractionResultSchema } from '../schemas/customer-extraction-schema';
import { columnMappingResultSchema } from '../schemas/column-mapping-schema';

describe('AI Zod Schemas Validation Suite', () => {
  it('validates textGenerationSchema', () => {
    const valid = textGenerationSchema.safeParse({
      prompt: 'Draft an email follow up',
      temperature: 0.5,
      maxTokens: 500,
    });
    expect(valid.success).toBe(true);

    const empty = textGenerationSchema.safeParse({ prompt: '' });
    expect(empty.success).toBe(false);
  });

  it('validates rawDocumentInputSchema', () => {
    const valid = rawDocumentInputSchema.safeParse({
      content: 'Contract agreement between Party A and Party B',
      fileName: 'contract_2026.pdf',
    });
    expect(valid.success).toBe(true);
  });

  it('validates leadExtractionResultSchema', () => {
    const valid = leadExtractionResultSchema.safeParse({
      leads: [
        {
          name: 'Sarah Connor',
          companyName: 'Cyberdyne Systems',
          email: 'sarah@cyberdyne.com',
          phone: '+1 555-0199',
          expectedDealValue: 50000,
          source: 'Web Form',
          priority: 'HIGH',
          tags: ['Enterprise'],
          confidenceScore: 0.95,
        },
      ],
      totalExtracted: 1,
      extractionSummary: 'Found 1 lead',
    });
    expect(valid.success).toBe(true);
  });

  it('validates customerExtractionResultSchema', () => {
    const valid = customerExtractionResultSchema.safeParse({
      customers: [
        {
          name: 'Wayne Enterprises',
          companyName: 'Wayne Enterprises Global LLC',
          email: 'accounts@waynecorp.com',
          phone: '+1 555-0100',
          taxNumber: 'US-9938291',
          currency: 'USD',
          status: 'ACTIVE',
          confidenceScore: 0.99,
        },
      ],
      totalExtracted: 1,
    });
    expect(valid.success).toBe(true);
  });

  it('validates columnMappingResultSchema', () => {
    const valid = columnMappingResultSchema.safeParse({
      mappings: [
        {
          sourceColumn: 'Full Name',
          targetField: 'name',
          confidence: 0.98,
          reasoning: 'Exact semantic match',
        },
      ],
      unmappedColumns: [],
      targetEntity: 'LEAD',
    });
    expect(valid.success).toBe(true);
  });
});
