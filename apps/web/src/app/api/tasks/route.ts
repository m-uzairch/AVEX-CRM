/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { taskFormSchema } from '@/features/tasks/schemas/task-schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const projectId = searchParams.get('projectId');
    const customerId = searchParams.get('customerId');
    const assigneeId = searchParams.get('assigneeId');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const isDeleted = searchParams.get('isDeleted') === 'true';
    const sortField = searchParams.get('sortField') || 'dueDate';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const where: any = { companyId };

    if (isDeleted) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    if (projectId && projectId !== 'ALL') {
      where.projectId = projectId;
    }

    if (customerId && customerId !== 'ALL') {
      where.customerId = customerId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (assigneeId && assigneeId !== 'ALL') {
      where.assignees = {
        some: { userId: assigneeId },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { labels: { has: search } },
      ];
    }

    const db = prisma as any;
    const total = await db.task.count({ where });
    const totalPages = Math.ceil(total / pageSize) || 1;

    const tasks = await db.task.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        project: {
          select: { id: true, projectCode: true, name: true },
        },
        customer: {
          select: { id: true, name: true, companyName: true },
        },
        createdBy: {
          select: { id: true, fullName: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatar: true },
            },
          },
        },
        subtasks: true,
        comments: true,
        attachments: true,
        timeEntries: true,
      },
    });

    return NextResponse.json({
      data: tasks,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error('[API GET /api/tasks] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tasks.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = taskFormSchema.parse(body);
    const companyId = body.companyId || 'comp_001';
    const db = prisma as any;

    const task = await db.task.create({
      data: {
        companyId,
        projectId: validated.projectId,
        customerId: validated.customerId || null,
        title: validated.title,
        description: validated.description || null,
        status: validated.status,
        priority: validated.priority,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        estimatedHours: validated.estimatedHours || null,
        labels: validated.labels || [],
        tags: validated.tags || [],
        createdById: 'usr_001',
        assignees: validated.assigneeIds && validated.assigneeIds.length > 0
          ? {
              create: validated.assigneeIds.map((userId: string) => ({
                userId,
              })),
            }
          : undefined,
        subtasks: validated.subtasks && validated.subtasks.length > 0
          ? {
              create: validated.subtasks.map((s: any) => ({
                title: s.title,
                dueDate: s.dueDate ? new Date(s.dueDate) : null,
              })),
            }
          : undefined,
      },
      include: {
        project: true,
        assignees: {
          include: { user: true },
        },
        subtasks: true,
      },
    });

    // Log Activity
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'TASK_CREATED',
          module: 'PROJECTS',
          category: 'TASK_MANAGEMENT',
          entityType: 'TASK',
          entityId: task.id,
          description: `Created task "${task.title}" under project #${task.projectId}`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/tasks] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create task.' },
      { status: 400 }
    );
  }
}
