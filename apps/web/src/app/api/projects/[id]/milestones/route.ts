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

    const milestones = await db.projectMilestone.findMany({
      where: { projectId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('[API GET /api/projects/[id]/milestones] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project milestones.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const milestone = await db.projectMilestone.create({
      data: {
        projectId: id,
        companyId: project.companyId,
        title: body.title,
        description: body.description || null,
        order: body.order || 0,
        status: body.status || 'PENDING',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/projects/[id]/milestones] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create project milestone.' },
      { status: 400 }
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

    if (!body.milestoneId) {
      return NextResponse.json({ error: 'milestoneId is required.' }, { status: 400 });
    }

    const milestone = await db.projectMilestone.update({
      where: { id: body.milestoneId, projectId: id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        status: body.status !== undefined ? body.status : undefined,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : undefined,
      },
    });

    return NextResponse.json({ milestone });
  } catch (error: any) {
    console.error('[API PATCH /api/projects/[id]/milestones] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update milestone.' },
      { status: 400 }
    );
  }
}
