'use client';

import * as React from 'react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Permission, UserRole } from '../types/rbac-types';
import { hasPermission } from '../config/rbac-matrix';

export interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const user = useAuthStore((state) => state.user);
  const role = (user?.role as UserRole) || 'EMPLOYEE';

  const isAllowed = hasPermission(role, permission);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
