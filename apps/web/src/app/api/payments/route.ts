/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { PaymentTrackingService } from '@/features/payments/services/payment-tracking-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const search = searchParams.get('search') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const invoiceId = searchParams.get('invoiceId') || undefined;

    const result = await PaymentTrackingService.getPaymentList(companyId, {
      search,
      paymentMethod,
      customerId,
      projectId,
      invoiceId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API GET /api/payments] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch payments list.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const recordedById = body.recordedById || 'usr_001';

    const payment = await PaymentTrackingService.recordPayment(companyId, recordedById, body);

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/payments] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record payment.' },
      { status: 400 }
    );
  }
}
