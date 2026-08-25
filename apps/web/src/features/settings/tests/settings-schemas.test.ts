import { describe, it, expect } from 'vitest';
import {
  userProfileSchema,
  accountSettingsSchema,
  companySettingsSchema,
  notificationPreferencesSchema,
  calendarSettingsSchema,
  changePasswordSchema,
  crmPreferencesSchema,
  testEmailSchema,
} from '../schemas/settings-schemas';

describe('Settings Validation Schemas', () => {
  describe('userProfileSchema', () => {
    it('should validate a complete profile', () => {
      const result = userProfileSchema.safeParse({
        fullName: 'Alex Carter',
        phone: '+1 555-0199',
        jobTitle: 'VP Engineering',
        bio: 'Overseeing CRM technical architecture.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short names', () => {
      const result = userProfileSchema.safeParse({
        fullName: 'A',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('accountSettingsSchema', () => {
    it('should validate standard regional settings', () => {
      const result = accountSettingsSchema.safeParse({
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '12h',
        defaultCurrency: 'USD',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid date or time format', () => {
      const result = accountSettingsSchema.safeParse({
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'INVALID_FORMAT',
        timeFormat: '36h',
        defaultCurrency: 'USD',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('companySettingsSchema', () => {
    it('should validate complete company data', () => {
      const result = companySettingsSchema.safeParse({
        name: 'Nexus Corp',
        legalName: 'Nexus Global Technologies Inc.',
        email: 'billing@nexus.com',
        phone: '+1 800-555-1234',
        address: '100 Market St',
        city: 'San Francisco',
        country: 'United States',
        website: 'https://nexus.com',
        logoUrl: 'https://nexus.com/logo.png',
        taxNumber: 'US-EIN-123456789',
        defaultCurrency: 'USD',
        businessType: 'DIGITAL',
        timezone: 'America/Los_Angeles',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email in company settings', () => {
      const result = companySettingsSchema.safeParse({
        name: 'Nexus Corp',
        email: 'invalid-email',
        defaultCurrency: 'USD',
        businessType: 'DIGITAL',
        timezone: 'UTC',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('notificationPreferencesSchema', () => {
    it('should validate full notification event matrix', () => {
      const result = notificationPreferencesSchema.safeParse({
        newLead: { inApp: true, email: true },
        leadAssignment: { inApp: true, email: true },
        customerUpdates: { inApp: true, email: false },
        taskAssignment: { inApp: true, email: true },
        projectUpdates: { inApp: true, email: false },
        invoiceEvents: { inApp: true, email: true },
        paymentEvents: { inApp: true, email: true },
        clientRequests: { inApp: true, email: true },
        clientMessages: { inApp: true, email: true },
        meetings: { inApp: true, email: true },
        attendanceEvents: { inApp: false, email: false },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('calendarSettingsSchema', () => {
    it('should validate working hours and reminder offsets', () => {
      const result = calendarSettingsSchema.safeParse({
        defaultView: 'WEEK',
        weekStartDay: 'MONDAY',
        timezone: 'UTC',
        workingHoursStart: '08:30',
        workingHoursEnd: '17:30',
        defaultEventDuration: 30,
        meetingReminders: 15,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format for working hours', () => {
      const result = calendarSettingsSchema.safeParse({
        defaultView: 'WEEK',
        weekStartDay: 'MONDAY',
        timezone: 'UTC',
        workingHoursStart: '25:00', // Invalid hour
        workingHoursEnd: '17:30',
        defaultEventDuration: 30,
        meetingReminders: 15,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should accept strong matching passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'SecurePassword2026!',
        confirmPassword: 'SecurePassword2026!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'SecurePassword2026!',
        confirmPassword: 'DifferentPassword2026!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("New passwords don't match");
      }
    });

    it('should reject weak passwords lacking uppercase or number', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'alllowercasepassword',
        confirmPassword: 'alllowercasepassword',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('crmPreferencesSchema & testEmailSchema', () => {
    it('should validate CRM layout preferences', () => {
      const result = crmPreferencesSchema.safeParse({
        defaultCustomerView: 'TABLE',
        defaultLeadView: 'KANBAN',
        defaultPipelineView: 'STAGE_COLUMNS',
        defaultInvoiceCurrency: 'USD',
        defaultQuotationCurrency: 'USD',
        defaultPageSize: 25,
        numberFormat: 'STANDARD',
        dateFormat: 'YYYY-MM-DD',
      });
      expect(result.success).toBe(true);
    });

    it('should validate test email recipient', () => {
      expect(testEmailSchema.safeParse({ recipientEmail: 'test@example.com' }).success).toBe(true);
      expect(testEmailSchema.safeParse({ recipientEmail: 'not-an-email' }).success).toBe(false);
    });
  });
});
