import { describe, it, expect } from 'vitest';
import { hasPermission, canAccessRoute } from '../config/rbac-matrix';

describe('RBAC Matrix Logic Suite', () => {
  describe('hasPermission()', () => {
    it('grants all permissions to COMPANY_OWNER role', () => {
      expect(hasPermission('COMPANY_OWNER', 'MANAGE_COMPANY')).toBe(true);
      expect(hasPermission('COMPANY_OWNER', 'MANAGE_USERS')).toBe(true);
      expect(hasPermission('COMPANY_OWNER', 'MANAGE_BILLING')).toBe(true);
    });

    it('restricts COMPANY_BILLING from EMPLOYEE role', () => {
      expect(hasPermission('EMPLOYEE', 'MANAGE_BILLING')).toBe(false);
      expect(hasPermission('EMPLOYEE', 'MANAGE_USERS')).toBe(false);
      expect(hasPermission('EMPLOYEE', 'MANAGE_PROJECTS')).toBe(true);
    });

    it('restricts CLIENT role to client portal permissions only', () => {
      expect(hasPermission('CLIENT', 'VIEW_CLIENT_PORTAL')).toBe(true);
      expect(hasPermission('CLIENT', 'MANAGE_CRM')).toBe(false);
      expect(hasPermission('CLIENT', 'MANAGE_COMPANY')).toBe(false);
    });
  });

  describe('canAccessRoute()', () => {
    it('authorizes allowed routes per role', () => {
      expect(canAccessRoute('COMPANY_OWNER', '/settings/users')).toBe(true);
      expect(canAccessRoute('COMPANY_OWNER', '/finance')).toBe(true);
      expect(canAccessRoute('ADMIN', '/crm')).toBe(true);
      expect(canAccessRoute('ADMIN', '/finance')).toBe(true);
      expect(canAccessRoute('EMPLOYEE', '/attendance')).toBe(true);
      expect(canAccessRoute('EMPLOYEE', '/finance')).toBe(true);
    });

    it('blocks unauthorized route access', () => {
      expect(canAccessRoute('EMPLOYEE', '/settings/users')).toBe(false);
      expect(canAccessRoute('CLIENT', '/crm')).toBe(false);
      expect(canAccessRoute('CLIENT', '/finance')).toBe(false);
    });
  });
});
