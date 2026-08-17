/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const db = prisma as any;
    const job = db.importJob
      ? await db.importJob.findUnique({ where: { id } })
      : null;

    const errorLog = job?.errorLog || [];

    if (format === 'json') {
      return new NextResponse(JSON.stringify(errorLog, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="import-error-report-${id}.json"`,
        },
      });
    }

    const headers = ['Row Number', 'Row ID', 'Lead Name', 'Email', 'Error Description', 'Suggested Fix'];
    const rows = errorLog.map((err: any) => [
      err.rowNumber || '-',
      `"${err.rowId || ''}"`,
      `"${(err.name || '').replace(/"/g, '""')}"`,
      `"${err.email || ''}"`,
      `"${(err.error || '').replace(/"/g, '""')}"`,
      `"${(err.suggestedFix || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="import-error-report-${id}.csv"`,
      },
    });
  } catch (error) {
    console.error('[API GET /api/crm/leads/import/jobs/[id]/report] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate error report.' },
      { status: 500 }
    );
  }
}
