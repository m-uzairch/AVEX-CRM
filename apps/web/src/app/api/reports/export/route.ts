/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ReportService } from '@/features/reports/services/report-service';
import { ReportType } from '@/features/reports/types/report-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reportType = (body.reportType || 'REVENUE') as ReportType;
    const format = body.format || 'CSV';
    const data = body.data || {};

    if (format === 'CSV') {
      const csvContent = ReportService.exportToCSV(reportType, data);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="avex_${reportType.toLowerCase()}_report.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, reportType, format, data });
  } catch (error: any) {
    console.error('[API POST /api/reports/export] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to export report.' },
      { status: 500 }
    );
  }
}
