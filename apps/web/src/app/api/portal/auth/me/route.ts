/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const db = prisma as any;

    let client = clientIdCookie
      ? await db.clientAccount.findUnique({
          where: { id: clientIdCookie },
          include: { customer: true },
        })
      : null;

    if (!client) {
      // Fallback first client account or customer for demo
      client = await db.clientAccount.findFirst({
        include: { customer: true },
      });
    }

    if (!client) {
      const customer = await db.customer.findFirst();
      if (customer) {
        client = await db.clientAccount.create({
          data: {
            companyId: customer.companyId,
            customerId: customer.id,
            email: customer.email || 'client@company.com',
            passwordHash: 'hashed_pwd',
            name: customer.name,
            phone: customer.phone,
          },
          include: { customer: true },
        });
      }
    }

    if (!client) {
      return NextResponse.json({ error: 'Client session not found.' }, { status: 401 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('[API GET /api/portal/auth/me] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve client profile.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const body = await request.json();
    const db = prisma as any;

    let client = clientIdCookie
      ? await db.clientAccount.findUnique({ where: { id: clientIdCookie } })
      : await db.clientAccount.findFirst();

    if (!client) {
      return NextResponse.json({ error: 'Client session not found.' }, { status: 401 });
    }

    const updatedClient = await db.clientAccount.update({
      where: { id: client.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        phone: body.phone !== undefined ? body.phone : undefined,
        email: body.email !== undefined ? body.email : undefined,
      },
      include: { customer: true },
    });

    return NextResponse.json({ client: updatedClient });
  } catch (error: any) {
    console.error('[API PATCH /api/portal/auth/me] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update client profile.' },
      { status: 400 }
    );
  }
}
