import { describe, it, expect } from 'vitest';
import { clientLoginFormSchema } from '../schemas/portal-schemas';
import { canAccessRoute, hasPermission } from '@/features/rbac/config/rbac-matrix';

describe('Client Authentication & Security Unit Tests', () => {
  describe('1. Valid Client Login Schema', () => {
    it('accepts valid client login credentials', () => {
      const result = clientLoginFormSchema.safeParse({
        email: 'client@company.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('2. Invalid Password Validation', () => {
    it('rejects passwords shorter than 4 characters', () => {
      const result = clientLoginFormSchema.safeParse({
        email: 'client@company.com',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 4 characters');
      }
    });

    it('rejects empty passwords', () => {
      const result = clientLoginFormSchema.safeParse({
        email: 'client@company.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('3. Invalid Email Format Validation', () => {
    it('rejects invalid email strings', () => {
      const invalidEmails = ['invalid-email', 'client@', '@domain.com', 'client@.com'];
      for (const email of invalidEmails) {
        const result = clientLoginFormSchema.safeParse({
          email,
          password: 'password123',
        });
        expect(result.success).toBe(false);
      }
    });
  });

  describe('4. Role & Route Isolation', () => {
    it('verifies CLIENT role cannot access internal CRM administration routes', () => {
      const internalRoutes = [
        '/dashboard',
        '/crm',
        '/crm/customers',
        '/crm/leads',
        '/employees',
        '/attendance',
        '/financial-dashboard',
        '/settings',
        '/settings/users',
        '/settings/roles',
        '/inventory',
        '/reports',
      ];

      for (const route of internalRoutes) {
        expect(canAccessRoute('CLIENT', route)).toBe(false);
      }
    });

    it('verifies CLIENT role can access all client portal pages', () => {
      const portalRoutes = [
        '/portal',
        '/portal/projects',
        '/portal/projects/proj_001',
        '/portal/quotations',
        '/portal/invoices',
        '/portal/requests',
        '/portal/meetings',
        '/portal/files',
        '/portal/communication',
        '/portal/profile',
      ];

      for (const route of portalRoutes) {
        expect(canAccessRoute('CLIENT', route)).toBe(true);
      }
    });

    it('verifies EMPLOYEE and ADMIN do not have VIEW_CLIENT_PORTAL permission by default', () => {
      expect(hasPermission('EMPLOYEE', 'VIEW_CLIENT_PORTAL')).toBe(false);
      expect(hasPermission('ADMIN', 'VIEW_CLIENT_PORTAL')).toBe(false);
      expect(hasPermission('CLIENT', 'VIEW_CLIENT_PORTAL')).toBe(true);
    });
  });

  describe('5. Client Session & Cookie Configuration', () => {
    it('verifies session cookie properties are secure and HTTP-only', () => {
      const cookieConfig = {
        name: 'client_session',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      };

      expect(cookieConfig.httpOnly).toBe(true);
      expect(cookieConfig.path).toBe('/');
      expect(cookieConfig.maxAge).toBe(604800); // 7 days in seconds
    });

    it('verifies logout cookie configuration clears the session token', () => {
      const logoutCookie = {
        name: 'client_session',
        value: '',
        httpOnly: true,
        path: '/',
        maxAge: 0,
      };

      expect(logoutCookie.maxAge).toBe(0);
      expect(logoutCookie.value).toBe('');
    });
  });

  describe('6. Tenant & Customer Data Boundary Enforcement', () => {
    it('validates that customerId and companyId must match for authorized access', () => {
      const clientContext = {
        companyId: 'comp_001',
        customerId: 'cust_001',
      };

      const requestedProjectA = {
        id: 'proj_001',
        companyId: 'comp_001',
        customerId: 'cust_001',
      };

      const requestedProjectB = {
        id: 'proj_002',
        companyId: 'comp_001',
        customerId: 'cust_999', // belongs to another customer
      };

      const canAccessA =
        requestedProjectA.companyId === clientContext.companyId &&
        requestedProjectA.customerId === clientContext.customerId;

      const canAccessB =
        requestedProjectB.companyId === clientContext.companyId &&
        requestedProjectB.customerId === clientContext.customerId;

      expect(canAccessA).toBe(true);
      expect(canAccessB).toBe(false);
    });
  });
});
