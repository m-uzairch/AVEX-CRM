/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import { sanitizeClientInvoice } from '@/features/portal/services/portal-financial-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const db = prisma as any;

    const invoice = await db.invoice.findFirst({
      where: {
        id,
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
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or unauthorized.' },
        { status: 404 }
      );
    }

    const formatted = sanitizeClientInvoice(invoice);

    return NextResponse.json({ invoice: formatted });
  } catch (error) {
    console.error('[API GET /api/portal/invoices/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve invoice details.' },
      { status: 500 }
    );
  }
}
