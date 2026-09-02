import { UserManagementRecord, UserInvitationInput } from '../types/rbac-types';
import { AuthUserStore } from '@/features/auth/services/auth-user-store';
import { hashPassword } from '@/lib/auth/password';

export class UserManagementService {
  static async getUsers(): Promise<UserManagementRecord[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/settings/users');
        if (res.ok) {
          const data = await res.json();
          return data.users;
        }
      } catch {
        // Fallback
      }
    }

    try {
      const { memoryUserManagementRecords } = await import('@/app/api/settings/users/route');
      return memoryUserManagementRecords || [];
    } catch {
      return [];
    }
  }

  static async inviteUser(input: UserInvitationInput): Promise<UserManagementRecord> {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create user account.');
      }

      const data = await res.json();
      return data.user;
    }

    // Direct execution for server/testing environments
    const normalizedEmail = input.email.trim().toLowerCase();
    const userId = `user_${Date.now()}`;
    const initialPassword = input.password || 'Password123!';
    const passwordHash = hashPassword(initialPassword);

    const newUser: UserManagementRecord = {
      id: userId,
      fullName: input.fullName,
      email: normalizedEmail,
      role: input.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    if (input.role === 'CLIENT') {
      AuthUserStore.registerOrUpdateClient({
        id: `client_${userId}`,
        companyId: 'comp_001',
        customerId: `cust_${userId}`,
        email: normalizedEmail,
        passwordHash,
        name: input.fullName,
        isActive: true,
        createdAt: newUser.createdAt,
      });
    } else {
      AuthUserStore.registerOrUpdateUser({
        id: userId,
        email: normalizedEmail,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        companyId: 'comp_001',
        companyName: 'AVEX CRM Technologies Inc.',
        businessType: 'DIGITAL',
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: newUser.createdAt,
      });
    }

    return newUser;
  }

  static async toggleUserStatus(id: string): Promise<UserManagementRecord> {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/settings/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-status' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update user status.');
      }

      const data = await res.json();
      return data.user;
    }

    return {
      id,
      fullName: 'User',
      email: 'user@company.com',
      role: 'EMPLOYEE',
      status: 'INACTIVE',
      createdAt: new Date().toISOString(),
    };
  }

  static async updateUserRole(id: string, newRole: UserManagementRecord['role']): Promise<UserManagementRecord> {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/settings/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update user role.');
      }

      const data = await res.json();
      return data.user;
    }

    return {
      id,
      fullName: 'User',
      email: 'user@company.com',
      role: newRole,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  }
}
