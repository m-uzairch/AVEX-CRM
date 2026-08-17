/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceTemplateService } from '@/features/invoices/services/invoice-template-service';

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const template = await InvoiceTemplateService.getTemplateById(params.id);
    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('[API GET /api/invoices/templates/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Template not found.' },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const template = await InvoiceTemplateService.updateTemplate(params.id, body);

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('[API PUT /api/invoices/templates/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update template.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const result = await InvoiceTemplateService.deleteTemplate(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API DELETE /api/invoices/templates/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete template.' },
      { status: 400 }
    );
  }
}
