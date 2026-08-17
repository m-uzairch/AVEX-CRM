import { describe, it, expect } from 'vitest';
import {
  leadFormSchema,
  leadNoteSchema,
  leadAssignSchema,
  leadConvertSchema,
  leadBulkActionSchema,
} from '../schemas/lead-schemas';

describe('Lead Management Validation Schemas', () => {
  it('validates a correct lead creation payload', () => {
    const validLead = {
      name: 'Robert Vance',
      companyName: 'Apex Innovations',
      email: 'robert@apexinnovations.com',
      phone: '+1 555-0192',
      source: 'Website',
      status: 'NEW',
      priority: 'HIGH',
      score: 75,
      tags: ['Hot Lead', 'Enterprise'],
    };

    const result = leadFormSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it('rejects lead payload with invalid email or out-of-bound score', () => {
    const invalidLead = {
      name: 'R',
      companyName: '',
      email: 'not-an-email',
      phone: '123',
      source: '',
      status: 'INVALID_STATUS',
      priority: 'SUPER_HIGH',
      score: 150, // exceeds 100
    };

    const result = leadFormSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  it('validates lead note schema', () => {
    expect(leadNoteSchema.safeParse({ content: 'Followed up via phone' }).success).toBe(true);
    expect(leadNoteSchema.safeParse({ content: '' }).success).toBe(false);
  });

  it('validates lead assignment schema', () => {
    expect(leadAssignSchema.safeParse({ assignedEmployeeId: 'emp-101' }).success).toBe(true);
    expect(leadAssignSchema.safeParse({ assignedEmployeeId: '' }).success).toBe(false);
  });

  it('validates lead conversion schema', () => {
    expect(leadConvertSchema.safeParse({ customerStatus: 'ACTIVE', notes: 'Converted successfully' }).success).toBe(true);
  });

  it('validates lead bulk action schema', () => {
    const validBulk = {
      leadIds: ['lead-1', 'lead-2'],
      action: 'CHANGE_STATUS',
      status: 'QUALIFIED',
    };
    expect(leadBulkActionSchema.safeParse(validBulk).success).toBe(true);
    expect(leadBulkActionSchema.safeParse({ leadIds: [], action: 'DELETE' }).success).toBe(false);
  });
});
