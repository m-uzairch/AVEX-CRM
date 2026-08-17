/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { TaxService } from '@/features/taxes/services/tax-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const userId = body.userId || 'usr_001';

    const discount = await TaxService.updateDiscount(companyId, userId, id, body);
    return NextResponse.json({ discount });
  } catch (error: any) {
    console.error('[API PUT /api/discounts/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update discount.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const userId = searchParams.get('userId') || 'usr_001';

    const result = await TaxService.deleteDiscount(companyId, userId, id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API DELETE /api/discounts/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete discount.' },
      { status: 400 }
    );
  }
}
