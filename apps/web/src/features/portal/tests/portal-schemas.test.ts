import { describe, it, expect } from 'vitest';
import {
  clientLoginFormSchema,
  changeRequestFormSchema,
  clientMessageFormSchema,
  clientProfileFormSchema,
  meetingRequestFormSchema,
} from '../schemas/portal-schemas';

describe('Portal Schemas Validation Tests', () => {
  describe('clientLoginFormSchema', () => {
    it('validates a correct client login payload', () => {
      const valid = {
        email: 'client@example.com',
        password: 'password123',
      };
      expect(clientLoginFormSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'password123',
      };
      expect(clientLoginFormSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects short passwords', () => {
      const invalid = {
        email: 'client@example.com',
        password: '12',
      };
      expect(clientLoginFormSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('changeRequestFormSchema', () => {
    it('validates a valid change request submission', () => {
      const valid = {
        projectId: 'proj_123',
        title: 'Add new payment gateway',
        description: 'We need to support Stripe and PayPal integrations.',
        priority: 'HIGH' as const,
      };
      expect(changeRequestFormSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects short titles or descriptions', () => {
      const invalid = {
        projectId: 'proj_123',
        title: 'No',
        description: 'Short',
        priority: 'MEDIUM' as const,
      };
      expect(changeRequestFormSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('clientMessageFormSchema', () => {
    it('validates a valid message', () => {
      const valid = {
        projectId: 'proj_123',
        content: 'Hello, what is the ETA for milestone 2?',
      };
      expect(clientMessageFormSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects empty message content', () => {
      const invalid = {
        projectId: 'proj_123',
        content: '',
      };
      expect(clientMessageFormSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('meetingRequestFormSchema', () => {
    it('validates a valid meeting request', () => {
      const valid = {
        projectId: 'proj_123',
        title: 'Sprint Review & Demo',
        description: 'Walkthrough of deliverables',
        preferredDate: '2026-08-30',
        preferredTime: '14:00',
        durationMinutes: 45,
      };
      expect(meetingRequestFormSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects missing preferred date/time', () => {
      const invalid = {
        title: 'Meeting without date',
        preferredDate: '',
        preferredTime: '',
      };
      expect(meetingRequestFormSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('clientProfileFormSchema', () => {
    it('validates valid client profile edits', () => {
      const valid = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 555-0199',
      };
      expect(clientProfileFormSchema.safeParse(valid).success).toBe(true);
    });
  });
});
