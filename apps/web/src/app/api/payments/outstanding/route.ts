/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { PaymentTrackingService } from '@/features/payments/services/payment-tracking-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const outstandingInvoices = await PaymentTrackingService.getOutstandingInvoices(companyId);

    return NextResponse.json({ outstandingInvoices });
  } catch (error: any) {
    console.error('[API GET /api/payments/outstanding] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch outstanding invoices.' },
      { status: 500 }
    );
  }
}
