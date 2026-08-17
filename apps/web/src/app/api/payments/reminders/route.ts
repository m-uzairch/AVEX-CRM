/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { PaymentTrackingService } from '@/features/payments/services/payment-tracking-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const invoiceId = body.invoiceId;
    const reminderType = body.reminderType || 'MANUAL';

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const result = await PaymentTrackingService.sendPaymentReminder(invoiceId, reminderType);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/payments/reminders] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send payment reminder.' },
      { status: 400 }
    );
  }
}
