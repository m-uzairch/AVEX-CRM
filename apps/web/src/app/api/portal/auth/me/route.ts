/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { AuthUserStore } from '@/features/auth/services/auth-user-store';

export async function GET(request: NextRequest) {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    if (!clientIdCookie) {
      return NextResponse.json(
        { error: 'Client session not found. Please log in.' },
        { status: 401 }
      );
    }

    const db = prisma as any;
    let client: any = null;

    try {
      if (db.clientAccount?.findUnique) {
        client = await db.clientAccount.findUnique({
          where: { id: clientIdCookie },
          include: {
            customer: true,
            company: { select: { id: true, name: true, logoUrl: true } },
          },
        });
      }
    } catch {
      // DB lookup fallback
    }

    if (!client) {
      client = AuthUserStore.findClientById(clientIdCookie) || AuthUserStore.findClientByEmail(clientIdCookie);
    }

    if (!client) {
      const res = NextResponse.json(
        { error: 'Client session not found. Please log in.' },
        { status: 401 }
      );
      res.cookies.delete('client_session');
      return res;
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

    let client: any = null;
    try {
      if (db.clientAccount?.findUnique && clientIdCookie) {
        client = await db.clientAccount.findUnique({
          where: { id: clientIdCookie },
          include: { customer: true, company: { select: { id: true, name: true, logoUrl: true } } },
        });
      }
    } catch {
      // DB lookup fallback
    }

    if (!client && clientIdCookie) {
      client = AuthUserStore.findClientById(clientIdCookie);
    }

    if (!client) {
      return NextResponse.json({ error: 'Client session not found.' }, { status: 401 });
    }

    if (client.isActive === false) {
      return NextResponse.json(
        { error: 'Your client account is inactive.' },
        { status: 403 }
      );
    }

    let updatedClient = { ...client };
    if (body.name !== undefined) updatedClient.name = body.name;
    if (body.phone !== undefined) updatedClient.phone = body.phone;
    if (body.email !== undefined) updatedClient.email = body.email;

    try {
      if (db.clientAccount?.update) {
        updatedClient = await db.clientAccount.update({
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
      }
    } catch {
      // Ignore DB write error in memory mode
    }

    return NextResponse.json({ client: updatedClient });
  } catch (error: any) {
    console.error('[API PATCH /api/portal/auth/me] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update client profile.' },
      { status: 400 }
    );
  }
}
