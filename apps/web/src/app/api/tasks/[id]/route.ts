/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    const task = await db.task.findUnique({
      where: { id },
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
        subtasks: {
          orderBy: { createdAt: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatar: true },
            },
          },
        },
        attachments: true,
        timeEntries: {
          orderBy: { createdAt: 'desc' },
        },
        dependencies: {
          include: {
            dependsOn: {
              select: { id: true, title: true, status: true },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('[API GET /api/tasks/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve task.' },
      { status: 500 }
    );
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

    const existingTask = await db.task.findUnique({ where: { id } });
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        status: body.status !== undefined ? body.status : undefined,
        priority: body.priority !== undefined ? body.priority : undefined,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : undefined,
        estimatedHours: body.estimatedHours !== undefined ? body.estimatedHours : undefined,
        labels: body.labels !== undefined ? body.labels : undefined,
        tags: body.tags !== undefined ? body.tags : undefined,
      },
      include: {
        project: true,
        assignees: { include: { user: true } },
        subtasks: true,
      },
    });

    // Log Activity if status changed
    if (body.status && body.status !== existingTask.status) {
      try {
        await db.activityLog.create({
          data: {
            companyId: existingTask.companyId,
            action: 'TASK_STATUS_CHANGED',
            module: 'PROJECTS',
            category: 'TASK_MANAGEMENT',
            entityType: 'TASK',
            entityId: id,
            description: `Updated status of task "${existingTask.title}" to ${body.status}`,
          },
        });
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error: any) {
    console.error('[API PATCH /api/tasks/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update task.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    // Soft delete
    await db.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Task soft deleted.' });
  } catch (error) {
    console.error('[API DELETE /api/tasks/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task.' },
      { status: 500 }
    );
  }
}
