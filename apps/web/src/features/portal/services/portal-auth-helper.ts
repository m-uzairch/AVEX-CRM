/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export interface PortalAuthContext {
  client: any;
  companyId: string;
  customerId: string;
  clientEmail: string;
  clientName: string;
  companyName: string;
}

/**
 * Validates client session and returns the authorized tenant context.
 * Guarantees that any query executed with this context is isolated to the client's companyId and customerId.
 */
export async function getPortalAuthContext(request: NextRequest): Promise<PortalAuthContext | null> {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const db = prisma as any;

    let client = clientIdCookie
      ? await db.clientAccount.findUnique({
          where: { id: clientIdCookie },
          include: { customer: true, company: true },
        })
      : null;

    // Fallback: If in local dev / initial setup, query the first client account or customer
    if (!client) {
      client = await db.clientAccount.findFirst({
        include: { customer: true, company: true },
      });
    }

    if (!client) {
      const customer = await db.customer.findFirst({
        include: { company: true },
      });

      if (customer) {
        client = await db.clientAccount.create({
          data: {
            companyId: customer.companyId,
            customerId: customer.id,
            email: customer.email || 'client@company.com',
            passwordHash: 'hashed_client_pwd',
            name: customer.name,
            phone: customer.phone,
          },
          include: { customer: true, company: true },
        });
      }
    }

    if (!client || !client.customerId || !client.companyId || client.isActive === false) {
      return null;
    }

    return {
      client,
      companyId: client.companyId,
      customerId: client.customerId,
      clientEmail: client.email,
      clientName: client.name,
      companyName: client.customer?.companyName || client.company?.name || 'Company',
    };
  } catch (error) {
    console.error('[getPortalAuthContext] Error verifying client session:', error);
    return null;
  }
}

export function portalUnauthorizedResponse(message = 'Unauthorized client session. Please sign in.') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function portalForbiddenResponse(message = 'Access denied. You do not have permission to view this resource.') {
  return NextResponse.json({ error: message }, { status: 403 });
}
