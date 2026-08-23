/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import { generateInvoicePdf } from '@/lib/pdf/pdf-generator';

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
        customer: true,
        company: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or unauthorized.' },
        { status: 404 }
      );
    }

    const pdfResult = generateInvoicePdf(invoice);

    return new NextResponse(new Uint8Array(pdfResult.buffer), {
      status: 200,
      headers: {
        'Content-Type': pdfResult.contentType,
        'Content-Disposition': `attachment; filename="${pdfResult.filename}"`,
        'Content-Length': String(pdfResult.sizeBytes),
      },
    });
  } catch (error) {
    console.error('[API GET /api/portal/invoices/[id]/pdf] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF.' },
      { status: 500 }
    );
  }
}
