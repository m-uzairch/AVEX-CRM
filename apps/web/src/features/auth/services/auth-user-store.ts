import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { UserRole } from '@/features/rbac/types/rbac-types';

export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  businessType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface ClientAccountRecord {
  id: string;
  companyId: string;
  customerId: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    companyName: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

// Pre-hashed default password 'Password123!'
const DEFAULT_HASHED_PASSWORD = hashPassword('Password123!');

export const memoryAuthUsers: AuthUserRecord[] = [
  {
    id: 'user_owner_001',
    email: 'admin@avexcrm.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'Alex Carter',
    role: 'COMPANY_OWNER',
    companyId: 'comp_001',
    companyName: 'AVEX CRM Technologies Inc.',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user_owner_001_io',
    email: 'admin@avexcrm.io',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'System Administrator',
    role: 'COMPANY_OWNER',
    companyId: 'comp_001',
    companyName: 'AVEX CRM Workspace',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user_owner_002',
    email: 'alex@acme.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'Alex Carter',
    role: 'COMPANY_OWNER',
    companyId: 'comp_001',
    companyName: 'Acme Global Enterprises',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_002',
    email: 'sarah@avexcrm.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'Sarah Jenkins',
    role: 'ADMIN',
    companyId: 'comp_001',
    companyName: 'AVEX CRM Technologies Inc.',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'usr_002_acme',
    email: 'sarah@acme.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'Sarah Jenkins',
    role: 'ADMIN',
    companyId: 'comp_001',
    companyName: 'Acme Global Enterprises',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'usr_003',
    email: 'marcus@avexcrm.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'Marcus Vance',
    role: 'EMPLOYEE',
    companyId: 'comp_001',
    companyName: 'AVEX CRM Technologies Inc.',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 'usr_003_acme',
    email: 'michael@acme.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'Michael Chen',
    role: 'EMPLOYEE',
    companyId: 'comp_001',
    companyName: 'Acme Global Enterprises',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 'usr_004',
    email: 'elena@avexcrm.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'Elena Rostova',
    role: 'EMPLOYEE',
    companyId: 'comp_001',
    companyName: 'AVEX CRM Technologies Inc.',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-04-01T00:00:00.000Z',
  },
  {
    id: 'usr_005',
    email: 'liam@avexcrm.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    fullName: 'Liam Chen',
    role: 'EMPLOYEE',
    companyId: 'comp_001',
    companyName: 'AVEX CRM Technologies Inc.',
    businessType: 'DIGITAL',
    status: 'ACTIVE',
    isEmailVerified: true,
    createdAt: '2024-05-01T00:00:00.000Z',
  },
];

export const memoryClientAccounts: ClientAccountRecord[] = [
  {
    id: 'client_demo_1',
    companyId: 'comp_001',
    customerId: 'cust_001',
    email: 'client@nexuscorp.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    name: 'Emily Watson',
    phone: '+1 (555) 234-5678',
    isActive: true,
    createdAt: '2024-01-15T00:00:00.000Z',
    customer: {
      id: 'cust_001',
      name: 'Emily Watson',
      companyName: 'Nexus Corp',
      email: 'client@nexuscorp.com',
    },
    company: {
      id: 'comp_001',
      name: 'AVEX CRM Technologies Inc.',
    },
  },
  {
    id: 'client_demo_2',
    companyId: 'comp_001',
    customerId: 'cust_002',
    email: 'emily@nexus.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    name: 'Emily Watson',
    phone: '+1 (555) 234-5678',
    isActive: true,
    createdAt: '2024-01-15T00:00:00.000Z',
    customer: {
      id: 'cust_002',
      name: 'Emily Watson',
      companyName: 'Nexus Corp',
      email: 'emily@nexus.com',
    },
    company: {
      id: 'comp_001',
      name: 'Acme Global Enterprises',
    },
  },
  {
    id: 'client_demo_3',
    companyId: 'comp_001',
    customerId: 'cust_003',
    email: 'client@company.com',
    passwordHash: DEFAULT_HASHED_PASSWORD,
    name: 'Valued Client',
    phone: '+1 (555) 987-6543',
    isActive: true,
    createdAt: '2024-01-15T00:00:00.000Z',
    customer: {
      id: 'cust_003',
      name: 'Valued Client',
      companyName: 'Client Enterprise Inc.',
      email: 'client@company.com',
    },
    company: {
      id: 'comp_001',
      name: 'AVEX CRM Technologies Inc.',
    },
  },
];

export class AuthUserStore {
  static findUserByEmail(email: string): AuthUserRecord | undefined {
    const normalized = email.trim().toLowerCase();
    return memoryAuthUsers.find((u) => u.email.toLowerCase() === normalized);
  }

  static findUserById(id: string): AuthUserRecord | undefined {
    return memoryAuthUsers.find((u) => u.id === id);
  }

  static findClientByEmail(email: string): ClientAccountRecord | undefined {
    const normalized = email.trim().toLowerCase();
    return memoryClientAccounts.find((c) => c.email.toLowerCase() === normalized);
  }

  static findClientById(id: string): ClientAccountRecord | undefined {
    return memoryClientAccounts.find((c) => c.id === id);
  }

  static authenticateUser(email: string, password: string): AuthUserRecord | null {
    if (!email || !password) return null;
    const user = this.findUserByEmail(email);
    if (!user) return null;

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) return null;

    return user;
  }

  static authenticateClient(email: string, password: string): ClientAccountRecord | null {
    if (!email || !password) return null;
    const client = this.findClientByEmail(email);
    if (!client) return null;

    const isValid = verifyPassword(password, client.passwordHash);
    if (!isValid) return null;

    return client;
  }

  static registerOrUpdateUser(record: Omit<AuthUserRecord, 'passwordHash'> & { password?: string; passwordHash?: string }): AuthUserRecord {
    const normalized = record.email.trim().toLowerCase();
    const existingIndex = memoryAuthUsers.findIndex((u) => u.email.toLowerCase() === normalized);

    const passwordHash = record.passwordHash || (record.password ? hashPassword(record.password) : DEFAULT_HASHED_PASSWORD);

    const userRecord: AuthUserRecord = {
      ...record,
      email: normalized,
      passwordHash,
    };

    if (existingIndex >= 0) {
      memoryAuthUsers[existingIndex] = {
        ...memoryAuthUsers[existingIndex],
        ...userRecord,
      };
      return memoryAuthUsers[existingIndex];
    } else {
      memoryAuthUsers.unshift(userRecord);
      return userRecord;
    }
  }

  static registerOrUpdateClient(record: Omit<ClientAccountRecord, 'passwordHash'> & { password?: string; passwordHash?: string }): ClientAccountRecord {
    const normalized = record.email.trim().toLowerCase();
    const existingIndex = memoryClientAccounts.findIndex((c) => c.email.toLowerCase() === normalized);

    const passwordHash = record.passwordHash || (record.password ? hashPassword(record.password) : DEFAULT_HASHED_PASSWORD);

    const clientRecord: ClientAccountRecord = {
      ...record,
      email: normalized,
      passwordHash,
    };

    if (existingIndex >= 0) {
      memoryClientAccounts[existingIndex] = {
        ...memoryClientAccounts[existingIndex],
        ...clientRecord,
      };
      return memoryClientAccounts[existingIndex];
    } else {
      memoryClientAccounts.unshift(clientRecord);
      return clientRecord;
    }
  }
}
