/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { RecurringInvoiceService } from '@/features/recurring-invoices/services/recurring-invoice-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const summary = await RecurringInvoiceService.getKPISummary(companyId);

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('[API GET /api/invoices/recurring/summary] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch summary.' },
      { status: 500 }
    );
  }
}
