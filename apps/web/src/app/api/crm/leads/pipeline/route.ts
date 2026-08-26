/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

const defaultStages = [
  { id: 'NEW', name: 'New Lead', color: 'border-blue-500/50 bg-blue-500/5', badgeBg: 'bg-blue-500/10 text-blue-600' },
  { id: 'CONTACTED', name: 'Contacted', color: 'border-purple-500/50 bg-purple-500/5', badgeBg: 'bg-purple-500/10 text-purple-600' },
  { id: 'QUALIFIED', name: 'Qualified', color: 'border-cyan-500/50 bg-cyan-500/5', badgeBg: 'bg-cyan-500/10 text-cyan-600' },
  { id: 'PROPOSAL_SENT', name: 'Proposal Sent', color: 'border-amber-500/50 bg-amber-500/5', badgeBg: 'bg-amber-500/10 text-amber-600' },
  { id: 'NEGOTIATION', name: 'Negotiation', color: 'border-indigo-500/50 bg-indigo-500/5', badgeBg: 'bg-indigo-500/10 text-indigo-600' },
  { id: 'WON', name: 'Won (Converted)', color: 'border-emerald-500/50 bg-emerald-500/5', badgeBg: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'LOST', name: 'Lost Opportunity', color: 'border-red-500/50 bg-red-500/5', badgeBg: 'bg-red-500/10 text-red-600' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const assignedEmployeeId = searchParams.get('assignedEmployeeId');
  const priority = searchParams.get('priority');
  const source = searchParams.get('source');
  const scoreRange = searchParams.get('scoreRange');
  const sortField = searchParams.get('sortField') || 'stageOrder';
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  const db = prisma as any;

  const companyId = searchParams.get('companyId');

  try {
    if (!db.lead) {
      return NextResponse.json({
        success: true,
        columns: defaultStages.map((s) => ({ ...s, leads: [], totalValue: 0, leadCount: 0 })),
        metrics: {
          totalLeads: 0,
          totalPipelineValue: 0,
          wonDealsCount: 0,
          lostDealsCount: 0,
          averageDealSize: 0,
          conversionRate: 0,
        },
      });
    }

    const where: any = {
      deletedAt: null,
      isArchived: false,
    };

    if (companyId && companyId !== 'ALL') {
      where.companyId = companyId;
    }

    if (assignedEmployeeId && assignedEmployeeId !== 'ALL') {
      where.assignedEmployeeId = assignedEmployeeId;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (source && source !== 'ALL') {
      where.source = source;
    }

    if (scoreRange && scoreRange !== 'ALL') {
      if (scoreRange === 'COLD') where.score = { gte: 0, lte: 25 };
      else if (scoreRange === 'WARM') where.score = { gte: 26, lte: 50 };
      else if (scoreRange === 'HOT') where.score = { gte: 51, lte: 75 };
      else if (scoreRange === 'VERY_HOT') where.score = { gte: 76, lte: 100 };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    let leads: any[] = [];
    try {
      leads = await db.lead.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        include: {
          assignedEmployee: {
            select: { id: true, fullName: true, email: true, avatar: true },
          },
          convertedCustomer: {
            select: { id: true, name: true, companyName: true },
          },
        },
      });
    } catch (dbErr) {
      console.warn('[API GET /api/crm/leads/pipeline] Prisma query error, falling back:', dbErr);
      leads = [];
    }

    // Group leads into stage columns
    const columns = defaultStages.map((stage) => {
      const stageLeads = leads.filter((l: any) => l.status === stage.id);
      const totalValue = stageLeads.reduce(
        (sum: number, l: any) => sum + (l.expectedDealValue || 0),
        0
      );

      return {
        ...stage,
        leads: stageLeads,
        totalValue,
        leadCount: stageLeads.length,
      };
    });

    // Overall pipeline summary metrics
    const totalLeads = leads.length;
    const totalPipelineValue = leads.reduce(
      (sum: number, l: any) => sum + (l.expectedDealValue || 0),
      0
    );
    const wonDealsCount = leads.filter((l: any) => l.status === 'WON' || l.isConverted).length;
    const lostDealsCount = leads.filter((l: any) => l.status === 'LOST').length;
    const averageDealSize =
      totalLeads > 0 ? Math.round(totalPipelineValue / totalLeads) : 0;
    const conversionRate =
      totalLeads > 0 ? Math.round((wonDealsCount / totalLeads) * 100) : 0;

    return NextResponse.json({
      success: true,
      columns,
      metrics: {
        totalLeads,
        totalPipelineValue,
        wonDealsCount,
        lostDealsCount,
        averageDealSize,
        conversionRate,
      },
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API GET /api/crm/leads/pipeline] Diagnostic Trace:', {
        companyId,
        search,
        assignedEmployeeId,
        priority,
        source,
        errorMessage: error?.message,
        stack: error?.stack,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to retrieve lead pipeline data.',
      },
      { status: 500 }
    );
  }
}
