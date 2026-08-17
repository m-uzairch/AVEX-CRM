/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { TaxService } from '@/features/taxes/services/tax-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const type = (searchParams.get('type') as any) || undefined;
    const applicableTo = (searchParams.get('applicableTo') as any) || undefined;

    const discounts = await TaxService.getDiscounts(companyId, {
      search,
      status,
      type,
      applicableTo,
    });
    return NextResponse.json({ discounts });
  } catch (error: any) {
    console.error('[API GET /api/discounts] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch discounts.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const userId = body.userId || 'usr_001';

    const discount = await TaxService.createDiscount(companyId, userId, body);
    return NextResponse.json({ discount }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/discounts] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create discount.' },
      { status: 400 }
    );
  }
}
