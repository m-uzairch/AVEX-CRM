/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { RecurringInvoiceService } from '@/features/recurring-invoices/services/recurring-invoice-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const companyId = body.companyId || 'comp_001';

    const result = await RecurringInvoiceService.processDueRecurringInvoices(companyId);

    return NextResponse.json({
      success: true,
      result,
      message: `Processed ${result.processedSchedules} schedules, generated ${result.generatedInvoicesCount} invoices.`,
    });
  } catch (error: any) {
    console.error('[API POST /api/invoices/recurring/process-jobs] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process recurring jobs.' },
      { status: 500 }
    );
  }
}
