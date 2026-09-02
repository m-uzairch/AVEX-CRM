/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { AuthUserStore } from '@/features/auth/services/auth-user-store';
import { hashPassword } from '@/lib/auth/password';
import { UserRole, UserManagementRecord } from '@/features/rbac/types/rbac-types';

export const memoryUserManagementRecords: UserManagementRecord[] = [
  {
    id: 'user_1',
    fullName: 'Alex Carter',
    email: 'admin@avexcrm.com',
    role: 'COMPANY_OWNER',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user_1_io',
    fullName: 'System Administrator',
    email: 'admin@avexcrm.io',
    role: 'COMPANY_OWNER',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user_1_acme',
    fullName: 'Alex Carter',
    email: 'alex@acme.com',
    role: 'COMPANY_OWNER',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user_2',
    fullName: 'Sarah Jenkins',
    email: 'sarah@avexcrm.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'user_2_acme',
    fullName: 'Sarah Jenkins',
    email: 'sarah@acme.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'user_3',
    fullName: 'Marcus Vance',
    email: 'marcus@avexcrm.com',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 'user_3_acme',
    fullName: 'Michael Chen',
    email: 'michael@acme.com',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 'user_4',
    fullName: 'Emily Watson',
    email: 'client@nexuscorp.com',
    role: 'CLIENT',
    status: 'ACTIVE',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'user_4_nexus',
    fullName: 'Emily Watson',
    email: 'emily@nexus.com',
    role: 'CLIENT',
    status: 'ACTIVE',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const db = prisma as any;

    let dbUsers: any[] = [];
    try {
      if (db.user?.findMany) {
        dbUsers = await db.user.findMany({
          where: { companyId: auth.companyId },
          include: { userRoles: { include: { role: true } } },
        });
      }
    } catch {
      // DB lookup fallback
    }

    if (dbUsers.length > 0) {
      const mapped = dbUsers.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: (u.userRoles?.[0]?.role?.name as UserRole) || 'EMPLOYEE',
        status: u.status || 'ACTIVE',
        avatarUrl: u.avatar,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      }));
      return NextResponse.json({ users: mapped });
    }

    return NextResponse.json({ users: memoryUserManagementRecords });
  } catch (error: any) {
    console.error('[API GET /api/settings/users] Error:', error);
    return NextResponse.json({ users: memoryUserManagementRecords });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json();

    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const role: UserRole = body.role || 'EMPLOYEE';
    const password = body.password || 'Password123!';

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email address are required.' },
        { status: 400 }
      );
    }

    const existingUser =
      AuthUserStore.findUserByEmail(email) ||
      AuthUserStore.findClientByEmail(email) ||
      memoryUserManagementRecords.find((u) => u.email.toLowerCase() === email);

    if (existingUser) {
      return NextResponse.json(
        { error: `An account or invitation already exists for email ${email}` },
        { status: 409 }
      );
    }

    const userId = `user_${Date.now()}`;
    const passwordHash = hashPassword(password);
    const db = prisma as any;

    if (role === 'CLIENT') {
      // 1. Create client account on the server
      AuthUserStore.registerOrUpdateClient({
        id: `client_${userId}`,
        companyId: auth.companyId || 'comp_001',
        customerId: `cust_${userId}`,
        email,
        passwordHash,
        name: fullName,
        isActive: true,
        createdAt: new Date().toISOString(),
        customer: {
          id: `cust_${userId}`,
          name: fullName,
          companyName: `${fullName}'s Company`,
          email,
        },
      });

      try {
        if (db.customer?.create) {
          const cust = await db.customer.create({
            data: {
              companyId: auth.companyId || 'comp_001',
              name: fullName,
              email,
              companyName: `${fullName}'s Company`,
              status: 'ACTIVE',
            },
          });

          if (db.clientAccount?.create && cust) {
            await db.clientAccount.create({
              data: {
                companyId: auth.companyId || 'comp_001',
                customerId: cust.id,
                email,
                name: fullName,
                passwordHash,
                isActive: true,
              },
            });
          }
        }
      } catch {
        // DB fallback
      }
    } else {
      // 2. Create staff / admin / employee account on the server
      AuthUserStore.registerOrUpdateUser({
        id: userId,
        email,
        passwordHash,
        fullName,
        role,
        companyId: auth.companyId || 'comp_001',
        companyName: auth.companyName || 'AVEX CRM Technologies Inc.',
        businessType: 'DIGITAL',
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      });

      try {
        if (db.user?.create) {
          await db.user.create({
            data: {
              id: userId,
              supabaseUserId: userId,
              companyId: auth.companyId || 'comp_001',
              email,
              fullName,
              status: 'ACTIVE',
            },
          });
        }

        if (db.employee?.create && role === 'EMPLOYEE') {
          await db.employee.create({
            data: {
              companyId: auth.companyId || 'comp_001',
              userId,
              fullName,
              email,
              role: 'Staff Specialist',
              employmentStatus: 'ACTIVE',
            },
          });
        }
      } catch {
        // DB fallback
      }
    }

    const newRecord: UserManagementRecord = {
      id: userId,
      fullName,
      email,
      role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    memoryUserManagementRecords.unshift(newRecord);

    return NextResponse.json({ user: newRecord }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/settings/users] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create user account.' },
      { status: 400 }
    );
  }
}
