/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { clientLoginFormSchema } from '@/features/portal/schemas/portal-schemas';
import { AuthUserStore } from '@/features/auth/services/auth-user-store';
import { verifyPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = clientLoginFormSchema.parse(body);
    const db = prisma as any;

    const email = validated.email.trim().toLowerCase();
    const password = validated.password;

    if (!password) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 1. Check if email belongs to an internal employee/admin/owner account (not a client)
    let internalUser: any = null;
    try {
      if (db.user?.findFirst) {
        internalUser = await db.user.findFirst({
          where: { email },
          include: { userRoles: { include: { role: true } } },
        });
      }
    } catch {
      // DB lookup fallback
    }

    if (!internalUser) {
      internalUser = AuthUserStore.findUserByEmail(email);
    }

    if (internalUser) {
      const isInternalStaff =
        internalUser.role === 'ADMIN' ||
        internalUser.role === 'EMPLOYEE' ||
        internalUser.role === 'COMPANY_OWNER' ||
        internalUser.userRoles?.some(
          (ur: any) =>
            ur.role?.name === 'ADMIN' ||
            ur.role?.name === 'EMPLOYEE' ||
            ur.role?.name === 'COMPANY_OWNER'
        );

      if (isInternalStaff) {
        return NextResponse.json(
          {
            error:
              'This is an internal staff account. Please sign in through the main AVEX CRM login portal.',
          },
          { status: 403 }
        );
      }
    }

    // 2. Query ClientAccount by email in DB or in-memory store
    let client: any = null;
    try {
      if (db.clientAccount?.findFirst) {
        client = await db.clientAccount.findFirst({
          where: { email },
          include: {
            customer: true,
            company: { select: { id: true, name: true, logoUrl: true } },
          },
        });
      }
    } catch {
      // DB lookup fallback
    }

    const memoryClient = AuthUserStore.findClientByEmail(email);

    if (!client && !memoryClient) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const clientActive = client ? client.isActive !== false : memoryClient?.isActive !== false;
    if (!clientActive) {
      return NextResponse.json(
        {
          error:
            'Your client portal account has been deactivated or suspended. Please contact your account manager.',
        },
        { status: 403 }
      );
    }

    // 3. Constant-time password verification
    const storedHash = client?.passwordHash || memoryClient?.passwordHash;
    if (!storedHash) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isPasswordValid = verifyPassword(password, storedHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const activeClient = client || memoryClient;

    // 4. Update last login timestamp if in DB
    try {
      if (db.clientAccount?.update && client?.id) {
        await db.clientAccount.update({
          where: { id: client.id },
          data: { lastLoginAt: new Date() },
        });
      }
    } catch {
      // DB update fallback
    }

    // 5. Establish authenticated session cookie
    const response = NextResponse.json({
      client: {
        id: activeClient.id,
        companyId: activeClient.companyId,
        customerId: activeClient.customerId,
        email: activeClient.email,
        name: activeClient.name,
        phone: activeClient.phone,
        avatar: activeClient.avatar,
        isActive: activeClient.isActive,
        lastLoginAt: new Date().toISOString(),
        customer: activeClient.customer,
        company: activeClient.company,
      },
      token: `client_token_${activeClient.id}`,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('client_session', activeClient.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[API POST /api/portal/auth/login] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Client authentication failed.' },
      { status: 400 }
    );
  }
}
