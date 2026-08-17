/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { clientLoginFormSchema } from '@/features/portal/schemas/portal-schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = clientLoginFormSchema.parse(body);
    const db = prisma as any;

    let client = await db.clientAccount.findFirst({
      where: { email: validated.email },
      include: { customer: true },
    });

    // If client account doesn't exist yet, check if there's a matching Customer to seed a client account
    if (!client) {
      const customer = await db.customer.findFirst({
        where: { email: validated.email },
      });

      if (customer) {
        client = await db.clientAccount.create({
          data: {
            companyId: customer.companyId,
            customerId: customer.id,
            email: customer.email || validated.email,
            passwordHash: 'hashed_pwd', // Demonstration auth
            name: customer.name,
            phone: customer.phone,
          },
          include: { customer: true },
        });
      }
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid client credentials or client account not registered.' },
        { status: 401 }
      );
    }

    // Update last login
    await db.clientAccount.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session cookie
    const response = NextResponse.json({ client, token: 'client_session_token' });
    response.cookies.set('client_session', client.id, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[API POST /api/portal/auth/login] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed.' },
      { status: 400 }
    );
  }
}
