import { describe, it, expect } from 'vitest';
import { canAccessRoute, hasPermission } from '@/features/rbac/config/rbac-matrix';

describe('Client Portal RBAC & Isolation Tests', () => {
  it('allows CLIENT role to access all /portal routes', () => {
    expect(canAccessRoute('CLIENT', '/portal')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/projects')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/projects/proj_123')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/quotations')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/invoices')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/requests')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/meetings')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/files')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/communication')).toBe(true);
    expect(canAccessRoute('CLIENT', '/portal/profile')).toBe(true);
  });

  it('strictly blocks CLIENT role from accessing internal CRM routes', () => {
    expect(canAccessRoute('CLIENT', '/dashboard')).toBe(false);
    expect(canAccessRoute('CLIENT', '/crm')).toBe(false);
    expect(canAccessRoute('CLIENT', '/crm/customers')).toBe(false);
    expect(canAccessRoute('CLIENT', '/employees')).toBe(false);
    expect(canAccessRoute('CLIENT', '/attendance')).toBe(false);
    expect(canAccessRoute('CLIENT', '/financial-dashboard')).toBe(false);
    expect(canAccessRoute('CLIENT', '/settings')).toBe(false);
    expect(canAccessRoute('CLIENT', '/settings/users')).toBe(false);
    expect(canAccessRoute('CLIENT', '/inventory')).toBe(false);
    expect(canAccessRoute('CLIENT', '/reports')).toBe(false);
  });

  it('verifies VIEW_CLIENT_PORTAL permission is granted to CLIENT', () => {
    expect(hasPermission('CLIENT', 'VIEW_CLIENT_PORTAL')).toBe(true);
    expect(hasPermission('CLIENT', 'MANAGE_COMPANY')).toBe(false);
    expect(hasPermission('CLIENT', 'MANAGE_USERS')).toBe(false);
    expect(hasPermission('CLIENT', 'MANAGE_SETTINGS')).toBe(false);
  });
});
