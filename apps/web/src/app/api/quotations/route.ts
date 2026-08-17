/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { QuotationService } from '@/features/quotations/services/quotation-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const estimateType = searchParams.get('estimateType') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const leadId = searchParams.get('leadId') || undefined;

    const result = await QuotationService.getQuotationList(companyId, {
      search,
      status,
      estimateType,
      customerId,
      leadId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API GET /api/quotations] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch quotations list.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    const quotation = await QuotationService.createQuotation(companyId, createdById, body);

    return NextResponse.json({ quotation }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/quotations] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create quotation.' },
      { status: 400 }
    );
  }
}
