/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

const DEFAULT_WIDGETS = [
  { id: 'widget_kpis', title: 'Executive KPI Metric Cards', isVisible: true, order: 1 },
  { id: 'widget_sales_chart', title: 'Monthly Revenue Growth & Sales Trend', isVisible: true, order: 2 },
  { id: 'widget_lead_customer', title: 'Lead Sources & Customer Industry Breakdown', isVisible: true, order: 3 },
  { id: 'widget_pipeline', title: 'Pipeline Stage Breakdown & Revenue Forecast', isVisible: true, order: 4 },
  { id: 'widget_employee', title: 'Employee Performance Scorecards', isVisible: true, order: 5 },
  { id: 'widget_recent_records', title: 'Recent Customers & Active Leads', isVisible: true, order: 6 },
  { id: 'widget_followups', title: 'Upcoming Follow-up Reminders', isVisible: true, order: 7 },
  { id: 'widget_activity', title: 'Recent CRM Activity Feed', isVisible: true, order: 8 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user_001';
    const db = prisma as any;

    const saved = await db.savedFilter.findFirst({
      where: { userId, module: 'DASHBOARD_WIDGETS' },
    });

    if (saved && saved.filterConfig) {
      return NextResponse.json({ widgets: saved.filterConfig });
    }

    return NextResponse.json({ widgets: DEFAULT_WIDGETS });
  } catch (error) {
    console.error('[API GET /api/crm/dashboard/preferences] Error:', error);
    return NextResponse.json({ widgets: DEFAULT_WIDGETS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, widgets } = await request.json();
    const effectiveUserId = userId || 'user_001';
    const db = prisma as any;

    const existing = await db.savedFilter.findFirst({
      where: { userId: effectiveUserId, module: 'DASHBOARD_WIDGETS' },
    });

    if (existing) {
      await db.savedFilter.update({
        where: { id: existing.id },
        data: { filterConfig: widgets },
      });
    } else {
      const firstCompany = await db.company.findFirst();
      await db.savedFilter.create({
        data: {
          companyId: firstCompany?.id || 'comp_001',
          userId: effectiveUserId,
          module: 'DASHBOARD_WIDGETS',
          name: 'Dashboard Widget Preferences',
          filterConfig: widgets,
        },
      });
    }

    return NextResponse.json({ success: true, widgets });
  } catch (error) {
    console.error('[API POST /api/crm/dashboard/preferences] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save widget preferences.' },
      { status: 500 }
    );
  }
}
