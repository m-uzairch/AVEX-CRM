import { UserManagementRecord, UserInvitationInput } from '../types/rbac-types';

const INITIAL_USERS: UserManagementRecord[] = [
  {
    id: 'user_1',
    fullName: 'Alex Carter',
    email: 'alex@acme.com',
    role: 'COMPANY_OWNER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_2',
    fullName: 'Sarah Jenkins',
    email: 'sarah@acme.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'user_3',
    fullName: 'Michael Chen',
    email: 'michael@acme.com',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'user_4',
    fullName: 'Emily Watson',
    email: 'emily@nexus.com',
    role: 'CLIENT',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export class UserManagementService {
  private static users: UserManagementRecord[] = [...INITIAL_USERS];

  static async getUsers(): Promise<UserManagementRecord[]> {
    return [...this.users];
  }

  static async inviteUser(input: UserInvitationInput): Promise<UserManagementRecord> {
    const existing = this.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      throw new Error(`An invitation or account already exists for email ${input.email}`);
    }

    const newUser: UserManagementRecord = {
      id: `user_${Date.now()}`,
      fullName: input.fullName,
      email: input.email,
      role: input.role,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.users.unshift(newUser);
    return newUser;
  }

  static async toggleUserStatus(id: string): Promise<UserManagementRecord> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) throw new Error('User not found');

    const user = this.users[userIndex];
    if (user.role === 'COMPANY_OWNER') {
      throw new Error('Cannot deactivate the Company Owner account.');
    }

    const updated: UserManagementRecord = {
      ...user,
      status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    };

    this.users[userIndex] = updated;
    return updated;
  }

  static async updateUserRole(id: string, newRole: UserManagementRecord['role']): Promise<UserManagementRecord> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) throw new Error('User not found');

    const user = this.users[userIndex];
    if (user.role === 'COMPANY_OWNER') {
      throw new Error('Cannot change the role of the Company Owner account.');
    }

    const updated: UserManagementRecord = {
      ...user,
      role: newRole,
    };

    this.users[userIndex] = updated;
    return updated;
  }
}
