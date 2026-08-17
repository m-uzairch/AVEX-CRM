/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceService } from '@/features/invoices/services/invoice-service';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();

    const invoice = await InvoiceService.recordPayment(
      params.id,
      body.companyId || 'comp_001',
      body.recordedById || 'usr_001',
      {
        amount: body.amount,
        paymentDate: body.paymentDate,
        paymentMethod: body.paymentMethod,
        referenceNumber: body.referenceNumber,
        notes: body.notes,
      }
    );

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/invoices/[id]/payment] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record payment.' },
      { status: 400 }
    );
  }
}
