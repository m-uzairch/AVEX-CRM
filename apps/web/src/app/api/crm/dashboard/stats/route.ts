/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'THIS_MONTH';
    const employeeId = searchParams.get('employeeId');
    const leadSource = searchParams.get('leadSource');
    const industry = searchParams.get('industry');
    const customerStatus = searchParams.get('customerStatus');

    const db = prisma as any;

    // Filter building
    const customerWhere: any = { deletedAt: null, isArchived: false };
    const leadWhere: any = { deletedAt: null, isArchived: false };

    const companyId = searchParams.get('companyId');
    if (companyId && companyId !== 'ALL') {
      customerWhere.companyId = companyId;
      leadWhere.companyId = companyId;
    }

    if (employeeId && employeeId !== 'ALL') {
      customerWhere.assignedEmployeeId = employeeId;
      leadWhere.assignedEmployeeId = employeeId;
    }

    if (industry && industry !== 'ALL') {
      customerWhere.industry = industry;
      leadWhere.industry = industry;
    }

    if (customerStatus && customerStatus !== 'ALL') {
      customerWhere.status = customerStatus;
    }

    if (leadSource && leadSource !== 'ALL') {
      leadWhere.source = leadSource;
    }

    // Date range filter
    const now = new Date();
    const startDate = new Date();
    if (dateRange === 'THIS_WEEK') {
      startDate.setDate(now.getDate() - 7);
      customerWhere.createdAt = { gte: startDate };
      leadWhere.createdAt = { gte: startDate };
    } else if (dateRange === 'THIS_MONTH') {
      startDate.setMonth(now.getMonth() - 1);
      customerWhere.createdAt = { gte: startDate };
      leadWhere.createdAt = { gte: startDate };
    } else if (dateRange === 'THIS_QUARTER') {
      startDate.setMonth(now.getMonth() - 3);
      customerWhere.createdAt = { gte: startDate };
      leadWhere.createdAt = { gte: startDate };
    } else if (dateRange === 'THIS_YEAR') {
      startDate.setFullYear(now.getFullYear() - 1);
      customerWhere.createdAt = { gte: startDate };
      leadWhere.createdAt = { gte: startDate };
    }

    // Database aggregation queries
    const [
      totalCustomers,
      activeCustomers,
      totalLeads,
      qualifiedLeads,
      wonDeals,
      lostDeals,
      leadsList,
      recentCustomersRaw,
      recentLeadsRaw,
    ] = await Promise.all([
      db.customer.count({ where: customerWhere }),
      db.customer.count({ where: { ...customerWhere, status: 'ACTIVE' } }),
      db.lead.count({ where: leadWhere }),
      db.lead.count({
        where: {
          ...leadWhere,
          status: { in: ['QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'] },
        },
      }),
      db.lead.count({ where: { ...leadWhere, status: 'WON' } }),
      db.lead.count({ where: { ...leadWhere, status: 'LOST' } }),
      db.lead.findMany({
        where: leadWhere,
        select: { expectedDealValue: true, winProbability: true, status: true },
      }),
      db.customer.findMany({
        where: customerWhere,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, companyName: true, status: true, createdAt: true },
      }),
      db.lead.findMany({
        where: leadWhere,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          assignedEmployee: {
            select: { fullName: true },
          },
        },
      }),
    ]);

    const conversionRate = totalLeads > 0 ? parseFloat(((wonDeals / totalLeads) * 100).toFixed(1)) : 0;
    const winRate = totalLeads > 0 ? parseFloat(((wonDeals / totalLeads) * 100).toFixed(1)) : 0;
    const lostRate = totalLeads > 0 ? parseFloat(((lostDeals / totalLeads) * 100).toFixed(1)) : 0;

    let totalPipelineValue = 0;
    let revenueForecast = 0;

    leadsList.forEach((l: any) => {
      const val = Number(l.expectedDealValue) || 0;
      const prob = (Number(l.winProbability) || 50) / 100;
      if (l.status !== 'LOST') {
        totalPipelineValue += val;
        revenueForecast += val * prob;
      }
    });

    const avgDealSize = wonDeals > 0
      ? Math.round(totalPipelineValue / wonDeals)
      : totalLeads > 0
      ? Math.round(totalPipelineValue / totalLeads)
      : 0;

    const formattedPipelineValue =
      totalPipelineValue >= 1000000
        ? `$${(totalPipelineValue / 1000000).toFixed(1)}M`
        : totalPipelineValue >= 1000
        ? `$${(totalPipelineValue / 1000).toFixed(0)}k`
        : `$${totalPipelineValue}`;

    const formattedRevenueForecast =
      revenueForecast >= 1000000
        ? `$${(revenueForecast / 1000000).toFixed(1)}M`
        : revenueForecast >= 1000
        ? `$${(revenueForecast / 1000).toFixed(0)}k`
        : `$${Math.round(revenueForecast)}`;

    const recentCustomers = recentCustomersRaw.map((c: any) => ({
      id: c.id,
      name: c.name,
      companyName: c.companyName,
      status: c.status,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    }));

    const recentLeads = recentLeadsRaw.map((l: any) => ({
      id: l.id,
      name: l.name,
      companyName: l.companyName,
      status: l.status,
      score: l.score ?? 50,
      assignedName: l.assignedEmployee?.fullName || 'Unassigned',
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt),
    }));

    const stats = {
      totalCustomers: totalCustomers ?? 0,
      activeCustomers: activeCustomers ?? 0,
      totalLeads: totalLeads ?? 0,
      qualifiedLeads: qualifiedLeads ?? 0,
      wonDeals: wonDeals ?? 0,
      lostDeals: lostDeals ?? 0,
      conversionRate,
      totalPipelineValue: Math.round(totalPipelineValue),
      avgDealSize,
      winRate,
      lostRate,
      revenueForecast: Math.round(revenueForecast),
      recentCustomers,
      recentLeads,
      kpis: [
        {
          id: 'kpi_cust',
          title: 'Total Customers',
          value: totalCustomers,
          percentageChange: 0,
          trend: 'neutral' as const,
          iconName: 'Users',
          description: 'Active company client profiles',
        },
        {
          id: 'kpi_active_cust',
          title: 'Active Accounts',
          value: activeCustomers,
          percentageChange: 0,
          trend: 'neutral' as const,
          iconName: 'UserCheck',
          description: 'Paying active subscription accounts',
        },
        {
          id: 'kpi_leads',
          title: 'Total Leads',
          value: totalLeads,
          percentageChange: 0,
          trend: 'neutral' as const,
          iconName: 'UserPlus',
          description: 'Sales prospects captured',
        },
        {
          id: 'kpi_qual_leads',
          title: 'Qualified Pipeline',
          value: qualifiedLeads,
          percentageChange: 0,
          trend: 'neutral' as const,
          iconName: 'CheckCircle2',
          description: 'High score qualified leads',
        },
        {
          id: 'kpi_won',
          title: 'Won Deals',
          value: wonDeals,
          percentageChange: 0,
          trend: 'neutral' as const,
          iconName: 'Trophy',
          description: 'Closed won deals',
        },
        {
          id: 'kpi_conversion',
          title: 'Conversion Rate',
          value: `${conversionRate}%`,
          percentageChange: 0,
          trend: 'neutral' as const,
          iconName: 'TrendingUp',
          description: 'Lead to customer conversion ratio',
        },
        {
          id: 'kpi_pipeline',
          title: 'Pipeline Value',
          value: formattedPipelineValue,
          percentageChange: 0,
          trend: 'neutral' as const,
          iconName: 'DollarSign',
          description: 'Active pipeline deal revenue',
        },
        {
          id: 'kpi_forecast',
          title: 'Revenue Forecast',
          value: formattedRevenueForecast,
          percentageChange: 0,
          trend: 'neutral' as const,
          iconName: 'Sparkles',
          description: 'Weighted probability projection',
        },
      ],
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[API GET /api/crm/dashboard/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard KPI statistics.' },
      { status: 500 }
    );
  }
}
