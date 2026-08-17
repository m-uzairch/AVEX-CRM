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

    const schedule = await RecurringInvoiceService.pauseBilling(id, userId);

    return NextResponse.json({ schedule, message: 'Billing schedule paused successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('[API POST /api/invoices/recurring/[id]/pause] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to pause schedule.' },
      { status: 500 }
    );
  }
}
