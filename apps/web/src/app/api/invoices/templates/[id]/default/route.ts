/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceTemplateService } from '@/features/invoices/services/invoice-template-service';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json().catch(() => ({}));
    const companyId = body.companyId || 'comp_001';

    const template = await InvoiceTemplateService.setDefaultTemplate(params.id, companyId);
    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('[API POST /api/invoices/templates/[id]/default] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to set default template.' },
      { status: 400 }
    );
  }
}
