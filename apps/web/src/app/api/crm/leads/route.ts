/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { leadFormSchema } from '@/features/crm/schemas/lead-schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const source = searchParams.get('source');
    const assignedEmployeeId = searchParams.get('assignedEmployeeId');
    const scoreRange = searchParams.get('scoreRange');
    const industry = searchParams.get('industry');
    const tagsParam = searchParams.get('tags');
    const isArchived = searchParams.get('isArchived') === 'true';
    const isDeleted = searchParams.get('isDeleted') === 'true';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const where: any = {};

    if (isDeleted) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
      where.isArchived = isArchived;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (source && source !== 'ALL') {
      where.source = source;
    }

    if (assignedEmployeeId && assignedEmployeeId !== 'ALL') {
      where.assignedEmployeeId = assignedEmployeeId;
    }

    if (industry && industry !== 'ALL') {
      where.industry = industry;
    }

    if (scoreRange && scoreRange !== 'ALL') {
      if (scoreRange === 'COLD') where.score = { gte: 0, lte: 25 };
      else if (scoreRange === 'WARM') where.score = { gte: 26, lte: 50 };
      else if (scoreRange === 'HOT') where.score = { gte: 51, lte: 75 };
      else if (scoreRange === 'VERY_HOT') where.score = { gte: 76, lte: 100 };
    }

    if (tagsParam) {
      const tagList = tagsParam.split(',').filter(Boolean);
      if (tagList.length > 0) {
        where.tags = { hasSome: tagList };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
      ];
    }

    const db = prisma as any;
    
    // Safety check if model exists in client
    if (!db.lead) {
      return NextResponse.json({
        data: [],
        total: 0,
        page: 1,
        pageSize,
        totalPages: 1,
      });
    }

    const total = await db.lead.count({ where });
    const totalPages = Math.ceil(total / pageSize) || 1;

    const leads = await db.lead.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        assignedEmployee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        convertedCustomer: {
          select: { id: true, name: true, companyName: true },
        },
      },
    });

    // Compute metrics stats for header widgets
    const allLeads = await db.lead.findMany({
      where: { deletedAt: null, isArchived: false },
      select: { score: true, status: true, isConverted: true, expectedDealValue: true },
    });

    const totalLeads = allLeads.length;
    const hotLeads = allLeads.filter((l: any) => l.score >= 51).length;
    const qualifiedLeads = allLeads.filter((l: any) => l.status === 'QUALIFIED').length;
    const convertedLeads = allLeads.filter((l: any) => l.isConverted).length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    const totalDealValue = allLeads.reduce((acc: number, curr: any) => acc + (curr.expectedDealValue || 0), 0);

    return NextResponse.json({
      data: leads,
      total,
      page,
      pageSize,
      totalPages,
      stats: {
        totalLeads,
        hotLeads,
        qualifiedLeads,
        convertedLeads,
        conversionRate,
        totalDealValue,
      },
    });
  } catch (error) {
    console.error('[API GET /api/crm/leads] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve leads.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = leadFormSchema.parse(body);

    const companyId = body.companyId || 'comp_001';
    const db = prisma as any;

    if (!db.lead) {
      return NextResponse.json(
        { error: 'Lead database model not initialized.' },
        { status: 500 }
      );
    }

    const lead = await db.lead.create({
      data: {
        companyId,
        assignedEmployeeId: validated.assignedEmployeeId || null,
        name: validated.name,
        companyName: validated.companyName,
        email: validated.email,
        phone: validated.phone,
        alternatePhone: validated.alternatePhone || null,
        country: validated.country || null,
        state: validated.state || null,
        city: validated.city || null,
        address: validated.address || null,
        postalCode: validated.postalCode || null,
        industry: validated.industry || null,
        businessType: validated.businessType || null,
        website: validated.website || null,
        companySize: validated.companySize || null,
        source: validated.source || 'Website',
        status: validated.status as any,
        priority: validated.priority as any,
        score: validated.score ?? 50,
        expectedDealValue: validated.expectedDealValue || null,
        expectedClosingDate: validated.expectedClosingDate
          ? new Date(validated.expectedClosingDate)
          : null,
        tags: validated.tags || [],
        createdBy: 'Alex Carter',
        updatedBy: 'Alex Carter',
      },
      include: {
        assignedEmployee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    // Create activity audit log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'LEAD_CREATED',
          module: 'CRM',
          description: `Created lead ${lead.name} (${lead.companyName}) with initial score ${lead.score}`,
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/crm/leads] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create lead record.' },
      { status: 400 }
    );
  }
}
