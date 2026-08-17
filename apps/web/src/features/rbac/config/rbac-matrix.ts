import { UserRole, Permission } from '../types/rbac-types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  COMPANY_OWNER: [
    'MANAGE_COMPANY',
    'MANAGE_USERS',
    'MANAGE_CRM',
    'MANAGE_PROJECTS',
    'MANAGE_EMPLOYEES',
    'MANAGE_ATTENDANCE',
    'MANAGE_INVOICES',
    'MANAGE_INVENTORY',
    'MANAGE_REPORTS',
    'MANAGE_SETTINGS',
    'MANAGE_BILLING',
  ],
  ADMIN: [
    'MANAGE_USERS',
    'MANAGE_CRM',
    'MANAGE_PROJECTS',
    'MANAGE_EMPLOYEES',
    'MANAGE_ATTENDANCE',
    'MANAGE_INVOICES',
    'MANAGE_INVENTORY',
    'MANAGE_REPORTS',
  ],
  EMPLOYEE: [
    'MANAGE_PROJECTS',
    'MANAGE_ATTENDANCE',
  ],
  CLIENT: [
    'VIEW_CLIENT_PORTAL',
  ],
};

export const ROLE_ALLOWED_ROUTES: Record<UserRole, string[]> = {
  COMPANY_OWNER: [
    '/dashboard',
    '/crm',
    '/projects',
    '/employees',
    '/attendance',
    '/quotations',
    '/invoices',
    '/payments',
    '/expenses',
    '/taxes',
    '/financial-dashboard',
    '/inventory',
    '/reports',
    '/calendar',
    '/notifications',
    '/settings',
    '/settings/users',
    '/settings/roles',
  ],
  ADMIN: [
    '/dashboard',
    '/crm',
    '/projects',
    '/employees',
    '/attendance',
    '/quotations',
    '/invoices',
    '/payments',
    '/expenses',
    '/taxes',
    '/financial-dashboard',
    '/inventory',
    '/reports',
    '/calendar',
    '/notifications',
    '/settings/users',
    '/settings/roles',
  ],
  EMPLOYEE: [
    '/dashboard',
    '/projects',
    '/attendance',
    '/quotations',
    '/payments',
    '/expenses',
    '/taxes',
    '/financial-dashboard',
    '/calendar',
    '/notifications',
  ],
  CLIENT: [
    '/dashboard',
    '/projects',
    '/quotations',
    '/invoices',
    '/payments',
    '/notifications',
  ],
};

export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessRoute(role: UserRole | undefined | null, path: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ALLOWED_ROUTES[role] || [];
  return allowed.some((route) => path === route || path.startsWith(`${route}/`));
}
