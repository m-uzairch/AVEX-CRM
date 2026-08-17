/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId = 'comp_001', reportType = 'PROJECT_PERFORMANCE', exportFormat = 'PDF', title, filters } = body;
    const db = prisma as any;

    // Record report history in database
    const historyItem = await db.reportHistory.create({
      data: {
        companyId,
        generatedById: body.userId || null,
        reportType,
        title: title || `${reportType.replace(/_/g, ' ')} Report`,
        exportFormat,
        filters: filters || null,
      },
    });

    // Record audit activity log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'REPORT_EXPORTED',
          module: 'REPORTS',
          category: 'PROJECT_ANALYTICS',
          entityType: 'REPORT',
          entityId: historyItem.id,
          description: `Exported ${exportFormat} report for ${reportType}`,
          metadata: { reportType, exportFormat, filters },
        },
      });
    } catch {
      // Non-critical audit logging failure
    }

    return NextResponse.json({ success: true, historyItem }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/projects/reports/export] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process report export.' },
      { status: 500 }
    );
  }
}
