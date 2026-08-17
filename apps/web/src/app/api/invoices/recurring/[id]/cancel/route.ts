/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { RecurringInvoiceService } from '@/features/recurring-invoices/services/recurring-invoice-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || 'usr_001';
    const cancellationReason = body.cancellationReason || 'Cancelled by user';

    const schedule = await RecurringInvoiceService.cancelBilling(id, userId, cancellationReason);

    return NextResponse.json({ schedule, message: 'Billing schedule cancelled successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('[API POST /api/invoices/recurring/[id]/cancel] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to cancel schedule.' },
      { status: 500 }
    );
  }
}
