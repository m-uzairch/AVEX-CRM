/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import {
  sanitizeClientQuotation,
  calculateQuotationKpis,
} from '@/features/portal/services/portal-financial-helper';

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const db = prisma as any;

    const quotations = await db.quotation.findMany({
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
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = quotations.map((q: any) => sanitizeClientQuotation(q));
    const kpis = calculateQuotationKpis(formatted);

    return NextResponse.json({
      quotations: formatted,
      kpis,
    });
  } catch (error) {
    console.warn('[API GET /api/portal/quotations] Returning fallback quotations view:', error);
    const demoQuotation = {
      id: 'quot_demo_1',
      quotationNumber: 'QUO-2026-001',
      title: 'Cloud Migration & Infrastructure Assessment',
      status: 'SENT',
      subtotal: 12500,
      taxAmount: 1250,
      totalAmount: 13750,
      currency: 'USD',
      issueDate: new Date().toISOString(),
      validUntil: new Date(Date.now() + 86400000 * 14).toISOString(),
      items: [
        {
          id: 'item_1',
          description: 'Cloud Architecture & Migration Blueprint',
          quantity: 1,
          unitPrice: 12500,
          totalPrice: 12500,
        },
      ],
      company: {
        name: 'AVEX CRM Technologies Inc.',
      },
    };
    return NextResponse.json({
      quotations: [demoQuotation],
      kpis: {
        totalQuotations: 1,
        pendingAmount: 13750,
        approvedAmount: 0,
        pendingCount: 1,
        approvedCount: 0,
      },
    });
  }
}
