/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import { sanitizeClientQuotation } from '@/features/portal/services/portal-financial-helper';

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

    const quotation = await db.quotation.findFirst({
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
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found or unauthorized.' },
        { status: 404 }
      );
    }

    const formatted = sanitizeClientQuotation(quotation);

    return NextResponse.json({ quotation: formatted });
  } catch (error) {
    console.error('[API GET /api/portal/quotations/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve quotation details.' },
      { status: 500 }
    );
  }
}
