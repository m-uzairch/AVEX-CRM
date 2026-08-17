/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { QuotationService } from '@/features/quotations/services/quotation-service';

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const quotation = await QuotationService.getQuotationById(params.id);
    return NextResponse.json({ quotation });
  } catch (error: any) {
    console.error('[API GET /api/quotations/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Quotation not found.' },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const quotation = await QuotationService.updateQuotation(params.id, body.updatedById || 'usr_001', body);

    return NextResponse.json({ quotation });
  } catch (error: any) {
    console.error('[API PUT /api/quotations/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update quotation.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const result = await QuotationService.softDeleteQuotation(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API DELETE /api/quotations/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete quotation.' },
      { status: 400 }
    );
  }
}
