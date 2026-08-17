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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    const milestone = await db.projectMilestone.findUnique({
      where: { id },
      include: {
        assignees: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
        dependencies: {
          include: { dependsOn: { select: { id: true, title: true, status: true } } },
        },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found.' }, { status: 404 });
    }

    return NextResponse.json({ milestone: computeDelayFields(milestone) });
  } catch (error) {
    console.error('[GET /api/milestones/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch milestone.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.progressPercentage !== undefined) updateData.progressPercentage = body.progressPercentage;
    if (body.estimatedHours !== undefined) updateData.estimatedHours = body.estimatedHours;
    if (body.budgetAllocation !== undefined) updateData.budgetAllocation = body.budgetAllocation;

    // Auto-set completionDate when marked COMPLETED
    if (body.status === 'COMPLETED') {
      updateData.completionDate = new Date();
      updateData.progressPercentage = 100;
    }

    const milestone = await db.projectMilestone.update({
      where: { id },
      data: updateData,
      include: {
        assignees: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
        dependencies: {
          include: { dependsOn: { select: { id: true, title: true, status: true } } },
        },
      },
    });

    return NextResponse.json({ milestone: computeDelayFields(milestone) });
  } catch (error: any) {
    console.error('[PATCH /api/milestones/[id]]', error);
    return NextResponse.json({ error: error?.message || 'Failed to update milestone.' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    await db.projectMilestone.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Milestone deleted.' });
  } catch (error) {
    console.error('[DELETE /api/milestones/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete milestone.' }, { status: 500 });
  }
}
