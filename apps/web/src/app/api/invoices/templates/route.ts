/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceTemplateService } from '@/features/invoices/services/invoice-template-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const templates = await InvoiceTemplateService.getTemplates(companyId);

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('[API GET /api/invoices/templates] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch invoice templates.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    const template = await InvoiceTemplateService.createTemplate(companyId, createdById, body);

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/invoices/templates] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create template.' },
      { status: 400 }
    );
  }
}
