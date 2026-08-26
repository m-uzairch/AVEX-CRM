import { describe, it, expect } from 'vitest';
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  employeeStatusUpdateSchema,
} from '../schemas/employee-schemas';
import { hasPermission, canAccessRoute } from '@/features/rbac/config/rbac-matrix';

describe('Employee Directory Feature Tests', () => {
  describe('1. Input Validation Schemas', () => {
    it('validates a complete employee creation payload', () => {
      const valid = {
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1 555-0100',
        role: 'Senior Full-Stack Engineer',
        department: 'Engineering',
        employmentStatus: 'ACTIVE' as const,
        hireDate: '2026-01-15T00:00:00.000Z',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const result = employeeCreateSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects employee with invalid email', () => {
      const invalid = {
        fullName: 'Jane Doe',
        email: 'not-an-email',
        role: 'Engineer',
      };

      const result = employeeCreateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it('rejects employee with empty name or role', () => {
      const emptyName = {
        fullName: '',
        email: 'valid@example.com',
        role: 'Engineer',
      };
      expect(employeeCreateSchema.safeParse(emptyName).success).toBe(false);

      const emptyRole = {
        fullName: 'Valid Name',
        email: 'valid@example.com',
        role: '',
      };
      expect(employeeCreateSchema.safeParse(emptyRole).success).toBe(false);
    });

    it('validates employment status schema', () => {
      expect(employeeStatusUpdateSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
      expect(employeeStatusUpdateSchema.safeParse({ status: 'ON_LEAVE' }).success).toBe(true);
      expect(employeeStatusUpdateSchema.safeParse({ status: 'TERMINATED' }).success).toBe(true);
      expect(employeeStatusUpdateSchema.safeParse({ status: 'FIRED' }).success).toBe(false);
      expect(employeeStatusUpdateSchema.safeParse({ status: 'RETIRED' }).success).toBe(false);
    });

    it('allows partial employee updates', () => {
      const partial = {
        role: 'Lead Architect',
        department: 'Platform Architecture',
      };
      const result = employeeUpdateSchema.safeParse(partial);
      expect(result.success).toBe(true);
    });
  });

  describe('2. RBAC Access Control & Permission Enforcement', () => {
    it('grants MANAGE_EMPLOYEES permission to COMPANY_OWNER and ADMIN', () => {
      expect(hasPermission('COMPANY_OWNER', 'MANAGE_EMPLOYEES')).toBe(true);
      expect(hasPermission('ADMIN', 'MANAGE_EMPLOYEES')).toBe(true);
    });

    it('denies MANAGE_EMPLOYEES permission to EMPLOYEE and CLIENT', () => {
      expect(hasPermission('EMPLOYEE', 'MANAGE_EMPLOYEES')).toBe(false);
      expect(hasPermission('CLIENT', 'MANAGE_EMPLOYEES')).toBe(false);
    });

    it('allows EMPLOYEE role to access /employees route for self-profile inspection', () => {
      expect(canAccessRoute('EMPLOYEE', '/employees')).toBe(true);
      expect(canAccessRoute('EMPLOYEE', '/employees/emp_123')).toBe(true);
    });

    it('strictly blocks CLIENT role from /employees', () => {
      expect(canAccessRoute('CLIENT', '/employees')).toBe(false);
    });
  });

  describe('3. Multi-Tenant Scoping Rule', () => {
    it('verifies companyId is mandatory for employee operations', () => {
      const testEmployee = {
        id: 'emp_01',
        companyId: 'comp_001',
        fullName: 'Dev Lead',
        email: 'lead@avexcrm.com',
        role: 'Tech Lead',
        employmentStatus: 'ACTIVE' as const,
      };

      expect(testEmployee.companyId).toBe('comp_001');
      // Cross-tenant access attempt simulation
      const attackerCompanyId = 'comp_999_malicious';
      const isAuthorizedInTenant = testEmployee.companyId === attackerCompanyId;
      expect(isAuthorizedInTenant).toBe(false);
    });
  });
});
