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

    const comments = await db.taskComment.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('[API GET /api/tasks/[id]/comments] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve task comments.' },
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

    const task = await db.task.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    const comment = await db.taskComment.create({
      data: {
        taskId: id,
        companyId: task.companyId,
        userId: body.userId || 'usr_001',
        content: body.content,
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/tasks/[id]/comments] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to post task comment.' },
      { status: 400 }
    );
  }
}
