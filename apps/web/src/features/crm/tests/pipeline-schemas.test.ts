import { describe, it, expect } from 'vitest';
import { leadStageUpdateSchema, dealInfoUpdateSchema } from '../schemas/pipeline-schemas';

describe('Pipeline & Kanban Zod Schemas', () => {
  it('validates a valid stage transition payload', () => {
    const valid = {
      toStage: 'PROPOSAL_SENT',
      stageOrder: 2,
    };
    expect(leadStageUpdateSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid stage values', () => {
    const invalid = {
      toStage: 'INVALID_STAGE',
    };
    expect(leadStageUpdateSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates deal info schema with win probability (0-100)', () => {
    const validDeal = {
      expectedDealValue: 45000,
      winProbability: 75,
      expectedClosingDate: '2026-09-30',
    };
    expect(dealInfoUpdateSchema.safeParse(validDeal).success).toBe(true);
  });

  it('rejects out-of-bound win probability', () => {
    const invalidDeal = {
      winProbability: 150, // exceeds 100
    };
    expect(dealInfoUpdateSchema.safeParse(invalidDeal).success).toBe(false);
  });
});
