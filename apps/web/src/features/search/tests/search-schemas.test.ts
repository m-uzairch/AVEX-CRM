import { describe, it, expect } from 'vitest';
import { createTagSchema, savedFilterSchema, bulkTagOperationSchema } from '../schemas/search-schemas';

describe('Global Search & Smart Tag Validation Schemas', () => {
  it('validates tag creation input with valid hex color', () => {
    const validTag = {
      name: 'VIP Enterprise',
      color: '#8B5CF6',
      description: 'High-value account tag',
    };
    expect(createTagSchema.safeParse(validTag).success).toBe(true);
  });

  it('rejects invalid hex colors for tags', () => {
    const invalidTag = {
      name: 'Startup',
      color: 'blue', // invalid hex
    };
    expect(createTagSchema.safeParse(invalidTag).success).toBe(false);
  });

  it('validates saved filter preset schema', () => {
    const validPreset = {
      name: 'High Score Leads',
      module: 'LEADS',
      filterConfig: { priority: 'HIGH', minScore: 75 },
    };
    expect(savedFilterSchema.safeParse(validPreset).success).toBe(true);
  });

  it('validates bulk tag operation schema', () => {
    const bulkPayload = {
      entityType: 'LEAD',
      entityIds: ['lead-1', 'lead-2'],
      action: 'ADD',
      tags: ['Hot Lead', 'VIP'],
    };
    expect(bulkTagOperationSchema.safeParse(bulkPayload).success).toBe(true);
  });
});
