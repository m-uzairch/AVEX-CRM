/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const moduleFilter = searchParams.get('module');
    const actionFilter = searchParams.get('action');
    const userId = searchParams.get('userId');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const dateRange = searchParams.get('dateRange');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const db = prisma as any;
    const where: any = {};

    if (moduleFilter && moduleFilter !== 'ALL') {
      where.module = moduleFilter;
    }

    if (actionFilter && actionFilter !== 'ALL') {
      where.action = actionFilter;
    }

    if (userId && userId !== 'ALL') {
      where.userId = userId;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (dateRange && dateRange !== 'ALL') {
      const now = new Date();
      const startDate = new Date();
      if (dateRange === 'TODAY') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === '7_DAYS') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === '30_DAYS') {
        startDate.setDate(now.getDate() - 30);
      } else if (dateRange === '90_DAYS') {
        startDate.setDate(now.getDate() - 90);
      }
      where.timestamp = { gte: startDate };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const total = await db.activityLog.count({ where });
    const totalPages = Math.ceil(total / pageSize) || 1;

    const activities = await db.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      activities,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[API GET /api/crm/activities] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve activity timeline.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      userId,
      action,
      module: moduleName,
      category,
      entityType,
      entityId,
      description,
      metadata,
    } = body;

    if (!action || !moduleName || !description) {
      return NextResponse.json(
        { error: 'action, module, and description are required.' },
        { status: 400 }
      );
    }

    const db = prisma as any;

    let effectiveCompanyId = companyId;
    if (!effectiveCompanyId) {
      const firstComp = await db.company.findFirst();
      effectiveCompanyId = firstComp?.id || 'comp_001';
    }

    const activity = await db.activityLog.create({
      data: {
        companyId: effectiveCompanyId,
        userId: userId || null,
        action,
        module: moduleName,
        category: category || moduleName || 'CRM',
        entityType: entityType || null,
        entityId: entityId || null,
        description,
        metadata: metadata || null,
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('[API POST /api/crm/activities] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log.' },
      { status: 500 }
    );
  }
}
