/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { FinancialDashboardService } from '@/features/financial-dashboard/services/financial-dashboard-service';
import { FinancialDateRange } from '@/features/financial-dashboard/types/financial-dashboard-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const dateRange = (searchParams.get('dateRange') as FinancialDateRange) || 'THIS_YEAR';

    const summary = await FinancialDashboardService.getFinancialSummary(companyId, dateRange);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('[API GET /api/financial-dashboard] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch financial dashboard summary.' },
      { status: 500 }
    );
  }
}
