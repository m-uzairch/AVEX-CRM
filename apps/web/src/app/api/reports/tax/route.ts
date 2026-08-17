/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ReportService } from '@/features/reports/services/report-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const data = await ReportService.generateTaxReport(companyId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('[API GET /api/reports/tax] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate tax report.' },
      { status: 500 }
    );
  }
}
