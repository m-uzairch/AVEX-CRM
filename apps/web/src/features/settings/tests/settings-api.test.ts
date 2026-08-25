import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getProfile, PUT as putProfile } from '@/app/api/settings/profile/route';
import { GET as getAccount, PUT as putAccount } from '@/app/api/settings/account/route';
import { GET as getCompany, PUT as putCompany } from '@/app/api/settings/company/route';
import { GET as getNotifications, PUT as putNotifications } from '@/app/api/settings/notifications/route';
import { GET as getEmail, POST as postEmail } from '@/app/api/settings/email/route';
import { GET as getCalendar, PUT as putCalendar } from '@/app/api/settings/calendar/route';
import { GET as getSecurity, POST as postSecurity } from '@/app/api/settings/security/route';
import { GET as getCrm, PUT as putCrm } from '@/app/api/settings/crm/route';

function createMockRequest(url: string, options: { method?: string; body?: any; cookies?: Record<string, string> } = {}) {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.cookies) {
    Object.entries(options.cookies).forEach(([k, v]) => {
      req.cookies.set(k, v);
    });
  }

  return req;
}

describe('Settings API & Multi-Tenant Security Suite', () => {
  describe('Profile Settings API', () => {
    it('GET /api/settings/profile returns user profile', async () => {
      const req = createMockRequest('/api/settings/profile');
      const res = await getProfile(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.profile).toBeDefined();
      expect(data.profile.fullName).toBeDefined();
      expect(data.profile.email).toBeDefined();
    });

    it('PUT /api/settings/profile updates user profile', async () => {
      const req = createMockRequest('/api/settings/profile', {
        method: 'PUT',
        body: {
          fullName: 'Alex Carter Updated',
          phone: '+1 555-9876',
          jobTitle: 'Chief Executive Officer',
          bio: 'Executive updates.',
        },
      });
      const res = await putProfile(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.profile.fullName).toBe('Alex Carter Updated');
    });
  });

  describe('Account Settings API', () => {
    it('GET & PUT /api/settings/account persists preferences', async () => {
      const putReq = createMockRequest('/api/settings/account', {
        method: 'PUT',
        body: {
          language: 'en-GB',
          timezone: 'Europe/London',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          defaultCurrency: 'GBP',
        },
      });
      const putRes = await putAccount(putReq);
      expect(putRes.status).toBe(200);
      const putData = await putRes.json();
      expect(putData.settings.defaultCurrency).toBe('GBP');

      const getReq = createMockRequest('/api/settings/account');
      const getRes = await getAccount(getReq);
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.settings.language).toBe('en-GB');
    });
  });

  describe('Company Settings API (Multi-Tenant & RBAC Security)', () => {
    it('GET /api/settings/company succeeds for COMPANY_OWNER', async () => {
      const req = createMockRequest('/api/settings/company', {
        cookies: { user_role: 'COMPANY_OWNER' },
      });
      const res = await getCompany(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.company).toBeDefined();
    });

    it('GET /api/settings/company is blocked for EMPLOYEE (403 Forbidden)', async () => {
      const req = createMockRequest('/api/settings/company', {
        cookies: { user_role: 'EMPLOYEE' },
      });
      const res = await getCompany(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Access denied');
    });

    it('GET /api/settings/company rejects cross-tenant ID manipulation', async () => {
      const req = createMockRequest('/api/settings/company?companyId=ATTACKER_FOREIGN_COMPANY', {
        cookies: { user_role: 'COMPANY_OWNER' },
      });
      const res = await getCompany(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Access denied');
    });

    it('PUT /api/settings/company rejects unauthorized role modification', async () => {
      const req = createMockRequest('/api/settings/company', {
        method: 'PUT',
        cookies: { user_role: 'EMPLOYEE' },
        body: {
          name: 'Hacked Company Name',
          email: 'hacked@company.com',
          defaultCurrency: 'USD',
          businessType: 'DIGITAL',
          timezone: 'UTC',
        },
      });
      const res = await putCompany(req);
      expect(res.status).toBe(403);
    });

    it('PUT /api/settings/company succeeds for authorized Admin/Owner', async () => {
      const req = createMockRequest('/api/settings/company', {
        method: 'PUT',
        cookies: { user_role: 'COMPANY_OWNER' },
        body: {
          name: 'AVEX CRM Technologies Inc.',
          legalName: 'AVEX CRM Technologies Corp',
          email: 'contact@avexcrm.com',
          phone: '+1 800-555-0199',
          website: 'https://avexcrm.com',
          defaultCurrency: 'USD',
          businessType: 'DIGITAL',
          timezone: 'America/Los_Angeles',
        },
      });
      const res = await putCompany(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.company.name).toBe('AVEX CRM Technologies Inc.');
    });
  });

  describe('Notification Preferences API', () => {
    it('GET & PUT /api/settings/notifications updates event delivery matrix', async () => {
      const req = createMockRequest('/api/settings/notifications', {
        method: 'PUT',
        body: {
          newLead: { inApp: true, email: true },
          leadAssignment: { inApp: true, email: true },
          customerUpdates: { inApp: true, email: true },
          taskAssignment: { inApp: true, email: false },
          projectUpdates: { inApp: true, email: false },
          invoiceEvents: { inApp: true, email: true },
          paymentEvents: { inApp: true, email: true },
          clientRequests: { inApp: true, email: true },
          clientMessages: { inApp: true, email: true },
          meetings: { inApp: true, email: true },
          attendanceEvents: { inApp: false, email: false },
        },
      });
      const res = await putNotifications(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.preferences.customerUpdates.email).toBe(true);

      const getReq = createMockRequest('/api/settings/notifications');
      const getRes = await getNotifications(getReq);
      expect(getRes.status).toBe(200);
    });
  });

  describe('Email Gateway API (Security & Secrets Isolation)', () => {
    it('GET /api/settings/email returns safe metadata without leaking secrets', async () => {
      const req = createMockRequest('/api/settings/email');
      const res = await getEmail(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.config).toBeDefined();
      expect(data.config.provider).toBeDefined();
      expect(data.config.senderEmail).toBeDefined();
      // Verify no raw secrets returned
      expect(JSON.stringify(data)).not.toContain('re_');
      expect(data.config.apiKey).toBeUndefined();
    });

    it('POST /api/settings/email sends test email safely', async () => {
      const req = createMockRequest('/api/settings/email', {
        method: 'POST',
        body: { recipientEmail: 'admin@company.com' },
      });
      const res = await postEmail(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Calendar & Availability API', () => {
    it('GET & PUT /api/settings/calendar updates working hours and defaults', async () => {
      const req = createMockRequest('/api/settings/calendar', {
        method: 'PUT',
        body: {
          defaultView: 'MONTH',
          weekStartDay: 'SUNDAY',
          timezone: 'America/New_York',
          workingHoursStart: '08:00',
          workingHoursEnd: '17:00',
          defaultEventDuration: 45,
          meetingReminders: 30,
        },
      });
      const res = await putCalendar(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.calendar.defaultEventDuration).toBe(45);

      const getReq = createMockRequest('/api/settings/calendar');
      const getRes = await getCalendar(getReq);
      expect(getRes.status).toBe(200);
    });
  });

  describe('Security & Password Management API', () => {
    it('GET /api/settings/security returns active sessions', async () => {
      const req = createMockRequest('/api/settings/security');
      const res = await getSecurity(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.security.sessions).toBeInstanceOf(Array);
      expect(data.security.sessions.length).toBeGreaterThan(0);
    });

    it('POST /api/settings/security rejects identical old and new passwords', async () => {
      const req = createMockRequest('/api/settings/security', {
        method: 'POST',
        body: {
          currentPassword: 'SamePassword123!',
          newPassword: 'SamePassword123!',
          confirmPassword: 'SamePassword123!',
        },
      });
      const res = await postSecurity(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('cannot be identical');
    });

    it('POST /api/settings/security accepts valid password change', async () => {
      const req = createMockRequest('/api/settings/security', {
        method: 'POST',
        body: {
          currentPassword: 'OldPassword123!',
          newPassword: 'BrandNewSecurePassword2026!',
          confirmPassword: 'BrandNewSecurePassword2026!',
        },
      });
      const res = await postSecurity(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('CRM Preferences API', () => {
    it('GET & PUT /api/settings/crm persists layout and formatting options', async () => {
      const req = createMockRequest('/api/settings/crm', {
        method: 'PUT',
        body: {
          defaultCustomerView: 'CARDS',
          defaultLeadView: 'LIST',
          defaultPipelineView: 'METRICS_TABLE',
          defaultInvoiceCurrency: 'EUR',
          defaultQuotationCurrency: 'EUR',
          defaultPageSize: 50,
          numberFormat: 'COMPACT',
          dateFormat: 'DD/MM/YYYY',
        },
      });
      const res = await putCrm(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.preferences.defaultLeadView).toBe('LIST');
      expect(data.preferences.defaultPageSize).toBe(50);

      const getReq = createMockRequest('/api/settings/crm');
      const getRes = await getCrm(getReq);
      expect(getRes.status).toBe(200);
    });
  });
});
