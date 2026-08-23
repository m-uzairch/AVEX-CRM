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
          include: {
            customer: true,
            company: { select: { id: true, name: true, logoUrl: true } },
          },
        })
      : null;

    if (!client) {
      // Fallback for initial demo environment if no cookie set
      client = await db.clientAccount.findFirst({
        where: { isActive: true },
        include: {
          customer: true,
          company: { select: { id: true, name: true, logoUrl: true } },
        },
      });
    }

    if (!client) {
      const customer = await db.customer.findFirst({ include: { company: true } });
      if (customer) {
        client = await db.clientAccount.create({
          data: {
            companyId: customer.companyId,
            customerId: customer.id,
            email: customer.email || 'client@company.com',
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

    if (!client) {
      return NextResponse.json(
        { error: 'Client session not found. Please log in.' },
        { status: 401 }
      );
    }

    if (client.isActive === false) {
      return NextResponse.json(
        { error: 'Your client account is inactive or suspended.' },
        { status: 403 }
      );
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
      : await db.clientAccount.findFirst({ where: { isActive: true } });

    if (!client) {
      return NextResponse.json({ error: 'Client session not found.' }, { status: 401 });
    }

    if (client.isActive === false) {
      return NextResponse.json(
        { error: 'Your client account is inactive.' },
        { status: 403 }
      );
    }

    const updatedClient = await db.clientAccount.update({
      where: { id: client.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        phone: body.phone !== undefined ? body.phone : undefined,
        email: body.email !== undefined ? body.email : undefined,
      },
      include: {
        customer: true,
        company: { select: { id: true, name: true, logoUrl: true } },
      },
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
