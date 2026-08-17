/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { PaymentTrackingService } from '@/features/payments/services/payment-tracking-service';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ customerId: string }> }
) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const summary = await PaymentTrackingService.getCustomerPaymentSummary(
      params.customerId,
      companyId
    );

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('[API GET /api/payments/summary/customer/[customerId]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch customer payment summary.' },
      { status: 500 }
    );
  }
}
