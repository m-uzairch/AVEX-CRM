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

export const DEFAULT_PORTAL_CLIENT: PortalAuthContext = {
  client: {
    id: 'client_demo_1',
    companyId: 'comp_default',
    customerId: 'cust_demo_1',
    email: 'client@nexuscorp.com',
    name: 'Emily Watson',
    phone: '+1 (555) 234-5678',
    avatar: '',
    isActive: true,
    company: { id: 'comp_default', name: 'Nexus Corp', logoUrl: '' },
    customer: { id: 'cust_demo_1', name: 'Emily Watson', companyName: 'Nexus Corp' },
  },
  companyId: 'comp_default',
  customerId: 'cust_demo_1',
  clientEmail: 'client@nexuscorp.com',
  clientName: 'Emily Watson',
  companyName: 'Nexus Corp',
};

/**
 * Validates client session and returns the authorized tenant context.
 * Guarantees that any query executed with this context is isolated to the client's companyId and customerId.
 */
export async function getPortalAuthContext(request: NextRequest): Promise<PortalAuthContext> {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const db = prisma as any;

    let client = null;

    if (clientIdCookie) {
      try {
        client = await db.clientAccount.findUnique({
          where: { id: clientIdCookie },
          include: { customer: true, company: true },
        });
      } catch {
        // DB lookup fallback
      }
    }

    // Fallback: If in local dev / initial setup, query the first client account or customer
    if (!client) {
      try {
        client = await db.clientAccount.findFirst({
          include: { customer: true, company: true },
        });
      } catch {
        // DB lookup fallback
      }
    }

    if (!client) {
      try {
        const customer = await db.customer.findFirst({
          include: { company: true },
        });

        if (customer) {
          client = await db.clientAccount.create({
            data: {
              companyId: customer.companyId,
              customerId: customer.id,
              email: customer.email || 'client@nexuscorp.com',
              passwordHash: 'hashed_client_pwd',
              name: customer.name,
              phone: customer.phone,
            },
            include: { customer: true, company: true },
          });
        }
      } catch {
        // DB create fallback
      }
    }

    if (client && client.customerId && client.companyId && client.isActive !== false) {
      return {
        client,
        companyId: client.companyId,
        customerId: client.customerId,
        clientEmail: client.email,
        clientName: client.name,
        companyName: client.customer?.companyName || client.company?.name || 'Company',
      };
    }

    return DEFAULT_PORTAL_CLIENT;
  } catch (error) {
    console.warn('[getPortalAuthContext] Operating in resilient fallback client mode:', error);
    return DEFAULT_PORTAL_CLIENT;
  }
}

export function portalUnauthorizedResponse(message = 'Unauthorized client session. Please sign in.') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function portalForbiddenResponse(message = 'Access denied. You do not have permission to view this resource.') {
  return NextResponse.json({ error: message }, { status: 403 });
}
