/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import { generateQuotationPdf } from '@/lib/pdf/pdf-generator';

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
        customer: true,
        company: true,
        items: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found or unauthorized.' },
        { status: 404 }
      );
    }

    const pdfResult = generateQuotationPdf(quotation);

    return new NextResponse(new Uint8Array(pdfResult.buffer), {
      status: 200,
      headers: {
        'Content-Type': pdfResult.contentType,
        'Content-Disposition': `attachment; filename="${pdfResult.filename}"`,
        'Content-Length': String(pdfResult.sizeBytes),
      },
    });
  } catch (error) {
    console.error('[API GET /api/portal/quotations/[id]/pdf] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quotation PDF.' },
      { status: 500 }
    );
  }
}
