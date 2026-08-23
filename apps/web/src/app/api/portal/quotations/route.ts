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
    console.error('[API GET /api/portal/quotations] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotations.' },
      { status: 500 }
    );
  }
}
