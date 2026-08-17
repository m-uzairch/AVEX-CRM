/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { RecurringInvoiceService } from '@/features/recurring-invoices/services/recurring-invoice-service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schedule = await RecurringInvoiceService.getRecurringInvoiceById(id);

    if (!schedule) {
      return NextResponse.json({ error: 'Recurring invoice schedule not found.' }, { status: 404 });
    }

    return NextResponse.json({ schedule }, { status: 200 });
  } catch (error: any) {
    console.error('[API GET /api/invoices/recurring/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch schedule.' },
      { status: 500 }
    );
  }
}
