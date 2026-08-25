import { describe, it, expect } from 'vitest';
import {
  dispatchNotificationSchema,
  notificationFilterSchema,
} from '../schemas/notification-schemas';

describe('Notification Schemas Validation', () => {
  describe('dispatchNotificationSchema', () => {
    it('should validate a valid notification payload', () => {
      const result = dispatchNotificationSchema.safeParse({
        type: 'PAYMENT_RECEIVED',
        category: 'FINANCE',
        priority: 'HIGH',
        title: 'Payment Received',
        message: 'Payment of $5,000 received for INV-1001',
        link: '/invoices/inv_001',
        entityType: 'INVOICE',
        entityId: 'inv_001',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid notification types', () => {
      const result = dispatchNotificationSchema.safeParse({
        type: 'INVALID_EVENT_TYPE',
        title: 'Bad Type',
        message: 'This has an invalid type',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty title or message', () => {
      const result = dispatchNotificationSchema.safeParse({
        type: 'LEAD_CREATED',
        title: '',
        message: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('notificationFilterSchema', () => {
    it('should parse filter query parameters', () => {
      const result = notificationFilterSchema.safeParse({
        search: 'Invoice',
        category: 'FINANCE',
        unreadOnly: true,
      });
      expect(result.success).toBe(true);
    });
  });
});
