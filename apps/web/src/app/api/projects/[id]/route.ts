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

    const project = await db.project.findUnique({
      where: { id },
      include: {
        customer: true,
        projectManager: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        category: true,
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('[API GET /api/projects/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project.' },
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

    const existing = await db.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedBy: 'Alex Carter',
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.customerId !== undefined) updateData.customerId = body.customerId || null;
    if (body.projectManagerId !== undefined) updateData.projectManagerId = body.projectManagerId || null;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.expectedCompletionDate !== undefined)
      updateData.expectedCompletionDate = body.expectedCompletionDate ? new Date(body.expectedCompletionDate) : null;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.isArchived !== undefined) updateData.isArchived = body.isArchived;

    // Set actualCompletionDate if status changed to COMPLETED
    if (body.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.actualCompletionDate = new Date();
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        projectManager: true,
        category: true,
        members: {
          include: { user: true },
        },
      },
    });

    // Log Activity
    try {
      const action = body.isArchived !== undefined
        ? body.isArchived
          ? 'PROJECT_ARCHIVED'
          : 'PROJECT_UNARCHIVED'
        : 'PROJECT_UPDATED';

      await db.activityLog.create({
        data: {
          companyId: existing.companyId,
          action,
          module: 'PROJECTS',
          category: 'PROJECT_MANAGEMENT',
          entityType: 'PROJECT',
          entityId: id,
          description: `Updated project ${existing.projectCode}: ${updatedProject.name}`,
          metadata: { projectCode: existing.projectCode, changes: body },
        },
      });
    } catch {
      // Ignore activity log write errors
    }

    return NextResponse.json({ project: updatedProject });
  } catch (error: any) {
    console.error('[API PATCH /api/projects/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update project.' },
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

    const existing = await db.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    // Perform soft delete by updating deletedAt timestamp
    await db.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: 'Alex Carter',
      },
    });

    // Log Activity
    try {
      await db.activityLog.create({
        data: {
          companyId: existing.companyId,
          action: 'PROJECT_DELETED',
          module: 'PROJECTS',
          category: 'PROJECT_MANAGEMENT',
          entityType: 'PROJECT',
          entityId: id,
          description: `Soft deleted project ${existing.projectCode}: ${existing.name}`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('[API DELETE /api/projects/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project.' },
      { status: 500 }
    );
  }
}
