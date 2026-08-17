/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceTemplateService } from '@/features/invoices/services/invoice-template-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const branding = await InvoiceTemplateService.getCompanyBranding(companyId);
    return NextResponse.json({ branding });
  } catch (error: any) {
    console.error('[API GET /api/invoices/branding] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch company branding.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';

    const branding = await InvoiceTemplateService.updateCompanyBranding(companyId, body);
    return NextResponse.json({ branding });
  } catch (error: any) {
    console.error('[API PUT /api/invoices/branding] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update company branding.' },
      { status: 400 }
    );
  }
}
