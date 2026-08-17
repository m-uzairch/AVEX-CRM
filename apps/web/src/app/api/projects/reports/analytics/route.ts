/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ProjectReportsService } from '@/features/projects/services/project-reports-service';
import { ReportFilterState } from '@/features/projects/types/project-report-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const filters: ReportFilterState = {
      dateRange: (searchParams.get('dateRange') as any) || 'ALL',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      projectId: searchParams.get('projectId') || undefined,
      projectManagerId: searchParams.get('projectManagerId') || undefined,
      employeeId: searchParams.get('employeeId') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      priority: searchParams.get('priority') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const analyticsData = await ProjectReportsService.getAnalyticsData(companyId, filters);

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error('[API GET /api/projects/reports/analytics] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch project analytics metrics.' },
      { status: 500 }
    );
  }
}
