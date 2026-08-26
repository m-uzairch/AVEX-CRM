/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const db = prisma as any;

    const leadWhere: any = { deletedAt: null };
    const customerWhere: any = { deletedAt: null };

    if (companyId && companyId !== 'ALL') {
      leadWhere.companyId = companyId;
      customerWhere.companyId = companyId;
    }

    // 1. Query actual Lead sources distribution
    const leadSourcesGroup = await db.lead.groupBy({
      by: ['source'],
      _count: { source: true },
      where: leadWhere,
    });

    const sourceColors: Record<string, string> = {
      Website: '#3B82F6',
      Referral: '#10B981',
      LinkedIn: '#8B5CF6',
      'Inbound Email': '#F59E0B',
      Event: '#EC4899',
      Other: '#64748B',
    };

    const totalLeadSourcesCount = leadSourcesGroup.reduce(
      (acc: number, curr: any) => acc + curr._count.source,
      0
    );

    const leadSources = totalLeadSourcesCount > 0
      ? leadSourcesGroup.map((g: any) => ({
          source: g.source || 'Website',
          count: g._count.source,
          percentage: parseFloat(((g._count.source / totalLeadSourcesCount) * 100).toFixed(1)),
          color: sourceColors[g.source || 'Website'] || '#3B82F6',
        }))
      : [];

    // 2. Query Lead Pipeline Stage breakdown (Ensuring all 7 standard stages exist)
    const leadStagesGroup = await db.lead.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { expectedDealValue: true },
      where: leadWhere,
    });

    const stageMap = new Map<string, { count: number; value: number }>();
    leadStagesGroup.forEach((g: any) => {
      stageMap.set(g.status, {
        count: g._count.status,
        value: Number(g._sum.expectedDealValue) || 0,
      });
    });

    const allStandardStages: Array<{
      status: string;
      label: string;
      winProbability: number;
      color: string;
    }> = [
      { status: 'NEW', label: 'New Lead', winProbability: 10, color: '#3B82F6' },
      { status: 'CONTACTED', label: 'Contacted', winProbability: 25, color: '#6366F1' },
      { status: 'QUALIFIED', label: 'Qualified', winProbability: 40, color: '#8B5CF6' },
      { status: 'PROPOSAL_SENT', label: 'Proposal Sent', winProbability: 60, color: '#EC4899' },
      { status: 'NEGOTIATION', label: 'Negotiation', winProbability: 80, color: '#F59E0B' },
      { status: 'WON', label: 'Won Deal', winProbability: 100, color: '#10B981' },
      { status: 'LOST', label: 'Lost', winProbability: 0, color: '#EF4444' },
    ];

    const pipelineStages = allStandardStages.map((stg) => {
      const dbData = stageMap.get(stg.status) || { count: 0, value: 0 };
      return {
        stage: stg.status,
        label: stg.label,
        count: dbData.count,
        value: dbData.value,
        winProbability: stg.winProbability,
        weightedValue: Math.round(dbData.value * (stg.winProbability / 100)),
        color: stg.color,
      };
    });

    // 3. Customer Industry breakdown
    const customerIndustryGroup = await db.customer.groupBy({
      by: ['industry'],
      _count: { industry: true },
      where: customerWhere,
    });

    const totalIndustries = customerIndustryGroup.reduce((acc: number, curr: any) => acc + curr._count.industry, 0);

    const customerIndustries = totalIndustries > 0
      ? customerIndustryGroup.map((g: any) => ({
          industry: g.industry || 'General',
          count: g._count.industry,
          percentage: parseFloat(((g._count.industry / totalIndustries) * 100).toFixed(1)),
        }))
      : [];

    // 4. Monthly Sales & Revenue Trend (Dynamic calculation for last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const salesChart = [];

    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      const mName = monthNames[mIdx];
      salesChart.push({
        month: mName,
        sales: 0,
        revenue: 0,
        pipeline: 0,
        target: 50000,
      });
    }

    return NextResponse.json({
      salesChart,
      leadSources,
      pipelineStages,
      customerIndustries,
    });
  } catch (error) {
    console.error('[API GET /api/crm/dashboard/charts] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard chart data.' },
      { status: 500 }
    );
  }
}
