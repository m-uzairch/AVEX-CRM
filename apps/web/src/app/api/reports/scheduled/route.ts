/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ReportService } from '@/features/reports/services/report-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    const scheduled = await ReportService.scheduleReport(
      companyId,
      createdById,
      body.title || 'Automated Financial Report',
      body.reportType || 'REVENUE',
      body.frequency || 'MONTHLY',
      body.recipients || ['admin@avexcrm.io'],
      body.filters || {}
    );

    return NextResponse.json({ scheduled }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/reports/scheduled] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to schedule report.' },
      { status: 500 }
    );
  }
}
