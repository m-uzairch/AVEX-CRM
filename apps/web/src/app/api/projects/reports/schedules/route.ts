/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const db = prisma as any;

    const schedules = await db.reportSchedule.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return NextResponse.json({ schedules });
  } catch (error: any) {
    console.error('[API GET /api/projects/reports/schedules] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch scheduled reports.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId = 'comp_001', title, reportType, frequency, recipients, exportFormat = 'PDF', filters } = body;
    const db = prisma as any;

    // Get an admin/first user for author reference
    const user = await db.user.findFirst({ where: { companyId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    const schedule = await db.reportSchedule.create({
      data: {
        companyId,
        createdById: user.id,
        title: title || `${frequency} ${reportType} Report`,
        reportType: reportType || 'PROJECT_PERFORMANCE',
        frequency: frequency || 'WEEKLY',
        recipients: Array.isArray(recipients) ? recipients : [recipients || user.email],
        exportFormat,
        filters: filters || null,
        isActive: true,
      },
    });

    // Record activity audit log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'SCHEDULED_REPORT_CREATED',
          module: 'REPORTS',
          category: 'PROJECT_ANALYTICS',
          entityType: 'REPORT_SCHEDULE',
          entityId: schedule.id,
          description: `Created ${frequency} report schedule: ${schedule.title}`,
          metadata: { scheduleId: schedule.id, frequency, recipients },
        },
      });
    } catch {
      // Non-critical audit logging failure
    }

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/projects/reports/schedules] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create report schedule.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }
    const db = prisma as any;

    await db.reportSchedule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API DELETE /api/projects/reports/schedules] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete report schedule.' },
      { status: 500 }
    );
  }
}
