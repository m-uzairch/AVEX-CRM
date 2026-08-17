/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { RecurringInvoiceService } from '@/features/recurring-invoices/services/recurring-invoice-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') || undefined) as any;
    const frequency = (searchParams.get('frequency') || undefined) as any;
    const customerId = searchParams.get('customerId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    console.log(`[API GET /api/invoices/recurring] CompanyID: ${companyId}`);

    const schedules = await RecurringInvoiceService.getRecurringInvoices(companyId, {
      search,
      status,
      frequency,
      customerId,
      projectId,
    });

    return NextResponse.json({ schedules }, { status: 200 });
  } catch (error: any) {
    console.error('[API GET /api/invoices/recurring] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch recurring invoice schedules.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    if (!body.templateName || !body.customerId || !body.billingStartDate || !body.frequency || !body.items) {
      return NextResponse.json(
        { error: 'Missing required fields: templateName, customerId, billingStartDate, frequency, items.' },
        { status: 400 }
      );
    }

    const schedule = await RecurringInvoiceService.createRecurringInvoice(companyId, createdById, body);

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/invoices/recurring] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create recurring invoice schedule.' },
      { status: 400 }
    );
  }
}
