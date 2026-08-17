/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { TaxService } from '@/features/taxes/services/tax-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const rules = await TaxService.getDiscountRules(companyId);
    return NextResponse.json({ rules });
  } catch (error: any) {
    console.error('[API GET /api/discounts/rules] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch discount rules.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const userId = body.userId || 'usr_001';

    const rule = await TaxService.createDiscountRule(companyId, userId, body);
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/discounts/rules] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create discount rule.' },
      { status: 400 }
    );
  }
}
