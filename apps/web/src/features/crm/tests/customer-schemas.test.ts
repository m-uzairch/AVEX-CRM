import { describe, it, expect } from 'vitest';
import { customerFormSchema } from '../schemas/customer-schemas';

describe('Customer Form Validation Schema', () => {
  it('validates a valid customer form payload', () => {
    const validData = {
      name: 'Sarah Jenkins',
      companyName: 'Acuity Solutions',
      email: 'sarah@acuity.com',
      phone: '+1 (555) 234-5678',
      industry: 'Software & Technology',
      businessType: 'DIGITAL',
      status: 'ACTIVE',
      priority: 'HIGH',
      tags: ['VIP', 'Enterprise'],
    };

    const result = customerFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects short names or invalid emails', () => {
    const invalidData = {
      name: 'A',
      companyName: '',
      email: 'invalid-email',
      phone: '123',
    };

    const result = customerFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.name?._errors.length).toBeGreaterThan(0);
      expect(formatted.email?._errors.length).toBeGreaterThan(0);
    }
  });

  it('allows optional fields to be empty strings or omitted', () => {
    const minimalData = {
      name: 'Michael Vance',
      companyName: 'Vance Tech',
      email: 'm.vance@vancetech.io',
      phone: '+1 (555) 876-5432',
      website: '',
      alternatePhone: '',
    };

    const result = customerFormSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });
});
