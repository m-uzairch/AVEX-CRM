/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

function computeDelayFields(milestone: any) {
  const now = new Date();
  const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null;
  const isOverdue =
    dueDate !== null &&
    dueDate < now &&
    milestone.status !== 'COMPLETED' &&
    milestone.status !== 'CANCELLED';

  const daysOverdue = isOverdue
    ? Math.floor((now.getTime() - dueDate!.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const daysRemaining =
    dueDate && !isOverdue && milestone.status !== 'COMPLETED'
      ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

  return { ...milestone, isOverdue, daysOverdue, daysRemaining };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required.' }, { status: 400 });
    }

    const db = prisma as any;
    const where: any = { projectId, deletedAt: null };
    if (!includeArchived) where.isArchived = false;
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;

    const milestones = await db.projectMilestone.findMany({
      where,
      orderBy: [{ order: 'asc' }, { dueDate: 'asc' }],
      include: {
        assignees: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        dependencies: {
          include: {
            dependsOn: { select: { id: true, title: true, status: true } },
          },
        },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    const enriched = milestones.map(computeDelayFields);

    return NextResponse.json({ milestones: enriched });
  } catch (error) {
    console.error('[GET /api/milestones]', error);
    return NextResponse.json({ error: 'Failed to fetch milestones.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id: body.projectId },
      select: { id: true, companyId: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const count = await db.projectMilestone.count({ where: { projectId: body.projectId } });

    const milestone = await db.projectMilestone.create({
      data: {
        companyId: project.companyId,
        projectId: body.projectId,
        title: body.title,
        description: body.description || null,
        status: body.status || 'NOT_STARTED',
        priority: body.priority || 'MEDIUM',
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        progressPercentage: body.progressPercentage || 0,
        estimatedHours: body.estimatedHours || null,
        budgetAllocation: body.budgetAllocation || null,
        order: count,
        createdById: 'usr_001',
      },
      include: {
        assignees: true,
        dependencies: true,
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    // Activity log
    try {
      await db.activityLog.create({
        data: {
          companyId: project.companyId,
          action: 'MILESTONE_CREATED',
          module: 'PROJECTS',
          category: 'MILESTONES',
          entityType: 'PROJECT',
          entityId: body.projectId,
          description: `Created milestone "${milestone.title}"`,
        },
      });
    } catch { /* ignore */ }

    return NextResponse.json({ milestone: computeDelayFields(milestone) }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/milestones]', error);
    return NextResponse.json({ error: error?.message || 'Failed to create milestone.' }, { status: 400 });
  }
}
