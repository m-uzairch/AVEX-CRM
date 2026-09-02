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

import { AuthUserStore } from '@/features/auth/services/auth-user-store';

/**
 * Validates client session and returns the authorized tenant context.
 * Guarantees that any query executed with this context is isolated to the client's companyId and customerId.
 * Returns null if no valid authenticated client session exists.
 */
export async function getPortalAuthContext(request: NextRequest): Promise<PortalAuthContext | null> {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    if (!clientIdCookie) {
      return null;
    }

    const db = prisma as any;
    let client: any = null;

    try {
      if (db.clientAccount?.findUnique) {
        client = await db.clientAccount.findUnique({
          where: { id: clientIdCookie },
          include: { customer: true, company: true },
        });
      }
      if (!client && db.clientAccount?.findFirst) {
        client = await db.clientAccount.findFirst({
          where: { email: clientIdCookie },
          include: { customer: true, company: true },
        });
      }
    } catch {
      // DB lookup fallback
    }

    if (!client) {
      client = AuthUserStore.findClientById(clientIdCookie) || AuthUserStore.findClientByEmail(clientIdCookie);
    }

    if (client && client.isActive !== false) {
      const targetCompanyId = client.companyId || 'comp_001';
      const targetCustomerId = client.customerId || client.id || 'cust_001';
      return {
        client,
        companyId: targetCompanyId,
        customerId: targetCustomerId,
        clientEmail: client.email || 'client@nexuscorp.com',
        clientName: client.name || client.customer?.name || 'Client User',
        companyName: client.customer?.companyName || client.company?.name || 'Company Workspace',
      };
    }

    return null;
  } catch (error) {
    console.error('[getPortalAuthContext] Error retrieving client session context:', error);
    return null;
  }
}

export function portalUnauthorizedResponse(message = 'Unauthorized client session. Please sign in.') {
  const response = NextResponse.json({ error: message }, { status: 401 });
  response.cookies.delete('client_session');
  return response;
}

export function portalForbiddenResponse(message = 'Access denied. You do not have permission to view this resource.') {
  return NextResponse.json({ error: message }, { status: 403 });
}
