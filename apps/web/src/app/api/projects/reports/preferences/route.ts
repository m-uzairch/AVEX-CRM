/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

const defaultWidgets = [
  { id: 'widget_kpis', title: 'Executive Summary Cards', category: 'General', isVisible: true, order: 1 },
  { id: 'widget_project_growth', title: 'Project Growth Trend', category: 'Charts', isVisible: true, order: 2 },
  { id: 'widget_task_completion', title: 'Task Completion Trend', category: 'Charts', isVisible: true, order: 3 },
  { id: 'widget_project_performance', title: 'Project Performance Table', category: 'Tables', isVisible: true, order: 4 },
  { id: 'widget_team_analytics', title: 'Team Utilization & Workload', category: 'Team', isVisible: true, order: 5 },
  { id: 'widget_task_milestones', title: 'Task & Milestone Breakdown', category: 'Metrics', isVisible: true, order: 6 },
  { id: 'widget_budget_variance', title: 'Budget vs Actual Variance', category: 'Finance', isVisible: true, order: 7 },
  { id: 'widget_resource_capacity', title: 'Capacity & Overload Highlights', category: 'Team', isVisible: true, order: 8 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const db = prisma as any;

    const user = await db.user.findFirst({ where: { companyId } });
    if (!user) {
      return NextResponse.json({ widgets: defaultWidgets });
    }

    const pref = await db.dashboardPreference.findUnique({
      where: { userId: user.id },
    });

    if (pref && pref.layout) {
      return NextResponse.json({ widgets: pref.layout });
    }

    return NextResponse.json({ widgets: defaultWidgets });
  } catch (error: any) {
    console.error('[API GET /api/projects/reports/preferences] Error:', error);
    return NextResponse.json({ widgets: defaultWidgets });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId = 'comp_001', layout } = body;
    const db = prisma as any;

    const user = await db.user.findFirst({ where: { companyId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    const pref = await db.dashboardPreference.upsert({
      where: { userId: user.id },
      update: { layout },
      create: {
        companyId,
        userId: user.id,
        layout,
      },
    });

    // Record activity audit log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'DASHBOARD_CUSTOMIZED',
          module: 'REPORTS',
          category: 'PROJECT_ANALYTICS',
          entityType: 'DASHBOARD_PREFERENCE',
          entityId: pref.id,
          description: 'Updated report dashboard widget preferences',
        },
      });
    } catch {
      // Non-critical audit logging failure
    }

    return NextResponse.json({ success: true, pref });
  } catch (error: any) {
    console.error('[API POST /api/projects/reports/preferences] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save dashboard preferences.' },
      { status: 400 }
    );
  }
}
