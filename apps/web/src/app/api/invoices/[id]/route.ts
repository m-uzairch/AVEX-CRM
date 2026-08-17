/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceService } from '@/features/invoices/services/invoice-service';

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const invoice = await InvoiceService.getInvoiceById(params.id);
    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('[API GET /api/invoices/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Invoice not found.' },
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
    const invoice = await InvoiceService.updateInvoice(params.id, body.updatedById || 'usr_001', body);

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('[API PUT /api/invoices/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update invoice.' },
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
    const result = await InvoiceService.softDeleteInvoice(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API DELETE /api/invoices/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete invoice.' },
      { status: 400 }
    );
  }
}
