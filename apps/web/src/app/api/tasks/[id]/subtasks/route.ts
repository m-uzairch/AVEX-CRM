/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    if (!body.title) {
      return NextResponse.json({ error: 'Subtask title is required.' }, { status: 400 });
    }

    const subtask = await db.subtask.create({
      data: {
        taskId: id,
        title: body.title,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    return NextResponse.json({ subtask }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/tasks/[id]/subtasks] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create subtask.' },
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

    if (!body.subtaskId) {
      return NextResponse.json({ error: 'subtaskId parameter is required.' }, { status: 400 });
    }

    const updatedSubtask = await db.subtask.update({
      where: { id: body.subtaskId, taskId: id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        isCompleted: body.isCompleted !== undefined ? body.isCompleted : undefined,
      },
    });

    return NextResponse.json({ subtask: updatedSubtask });
  } catch (error: any) {
    console.error('[API PATCH /api/tasks/[id]/subtasks] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update subtask.' },
      { status: 400 }
    );
  }
}
