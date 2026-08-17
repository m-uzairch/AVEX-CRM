/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { QuotationService } from '@/features/quotations/services/quotation-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    const result = await QuotationService.convertToInvoice(id, companyId, createdById);

    return NextResponse.json({ success: true, invoice: result.invoice, quotation: result.quotation });
  } catch (error: any) {
    console.error('[API POST /api/quotations/[id]/convert] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to convert quotation to invoice.' },
      { status: 500 }
    );
  }
}
