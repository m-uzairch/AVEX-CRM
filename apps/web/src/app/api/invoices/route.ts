/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceService } from '@/features/invoices/services/invoice-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    const result = await InvoiceService.getInvoiceList(companyId, {
      search,
      status,
      customerId,
      projectId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API GET /api/invoices] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch invoices list.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    const invoice = await InvoiceService.createInvoice(companyId, createdById, body);

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/invoices] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create invoice.' },
      { status: 400 }
    );
  }
}
