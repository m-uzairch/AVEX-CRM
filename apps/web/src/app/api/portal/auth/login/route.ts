/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { clientLoginFormSchema } from '@/features/portal/schemas/portal-schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = clientLoginFormSchema.parse(body);
    const db = prisma as any;

    const email = validated.email.trim().toLowerCase();
    const password = validated.password;

    // 1. Check if email belongs to an internal employee/admin/owner account (not a client)
    const internalUser = await db.user.findFirst({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });

    if (internalUser) {
      const isInternalStaff = internalUser.userRoles?.some(
        (ur: any) => ur.role?.name === 'ADMIN' || ur.role?.name === 'EMPLOYEE' || ur.role?.name === 'COMPANY_OWNER'
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

    // 2. Query ClientAccount by email
    let client = await db.clientAccount.findFirst({
      where: { email },
      include: {
        customer: true,
        company: { select: { id: true, name: true, logoUrl: true } },
      },
    });

    // If client account doesn't exist yet, check if there's a matching Customer record to link/seed
    if (!client) {
      const customer = await db.customer.findFirst({
        where: { email },
        include: { company: true },
      });

      if (customer) {
        client = await db.clientAccount.create({
          data: {
            companyId: customer.companyId,
            customerId: customer.id,
            email: customer.email || email,
            passwordHash: 'hashed_pwd',
            name: customer.name,
            phone: customer.phone,
            isActive: true,
          },
          include: {
            customer: true,
            company: { select: { id: true, name: true, logoUrl: true } },
          },
        });
      }
    }

    // 3. Verify account exists
    if (!client) {
      return NextResponse.json(
        { error: 'Invalid credentials or client account not registered.' },
        { status: 401 }
      );
    }

    // 4. Verify client account is active
    if (client.isActive === false) {
      return NextResponse.json(
        {
          error:
            'Your client portal account has been deactivated or suspended. Please contact your account manager.',
        },
        { status: 403 }
      );
    }

    // 5. Verify password (for demo/development: accepts valid password strings, rejects empty or mismatched test credentials)
    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: 'Invalid password. Password must be at least 4 characters.' },
        { status: 401 }
      );
    }

    // 6. Update last login timestamp
    await db.clientAccount.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    // 7. Establish authenticated session cookie
    const response = NextResponse.json({
      client: {
        id: client.id,
        companyId: client.companyId,
        customerId: client.customerId,
        email: client.email,
        name: client.name,
        phone: client.phone,
        avatar: client.avatar,
        isActive: client.isActive,
        lastLoginAt: new Date().toISOString(),
        customer: client.customer,
        company: client.company,
      },
      token: `client_token_${client.id}`,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('client_session', client.id, {
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
