/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import {
  sanitizeClientInvoice,
  calculateInvoiceKpis,
} from '@/features/portal/services/portal-financial-helper';

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const db = prisma as any;

    const invoices = await db.invoice.findMany({
      where: {
        companyId,
        customerId,
        deletedAt: null,
      },
      include: {
        company: {
          include: {
            branding: true,
          },
        },
        customer: true,
        project: { select: { id: true, name: true, projectCode: true } },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { paymentDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = invoices.map((inv: any) => sanitizeClientInvoice(inv));
    const kpis = calculateInvoiceKpis(formatted);

    return NextResponse.json({
      invoices: formatted,
      kpis,
    });
  } catch (error) {
    console.error('[API GET /api/portal/invoices] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices.' },
      { status: 500 }
    );
  }
}
