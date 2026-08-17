/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { TaxService } from '@/features/taxes/services/tax-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const summary = await TaxService.getTaxSummary(companyId);
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('[API GET /api/taxes/summary] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch tax summary.' },
      { status: 500 }
    );
  }
}
