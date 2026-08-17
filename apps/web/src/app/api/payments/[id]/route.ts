/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { PaymentTrackingService } from '@/features/payments/services/payment-tracking-service';

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const payment = await PaymentTrackingService.getPaymentById(params.id);
    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error('[API GET /api/payments/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Payment record not found.' },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const result = await PaymentTrackingService.softDeletePayment(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API DELETE /api/payments/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to soft delete payment record.' },
      { status: 400 }
    );
  }
}
