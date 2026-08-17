/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceTemplateService } from '@/features/invoices/services/invoice-template-service';

export async function POST(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const template = await InvoiceTemplateService.duplicateTemplate(params.id);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/invoices/templates/[id]/duplicate] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to duplicate template.' },
      { status: 400 }
    );
  }
}
