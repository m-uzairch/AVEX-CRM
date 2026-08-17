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

    const task = await db.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    if (body.action === 'START') {
      const timeEntry = await db.timeEntry.create({
        data: {
          taskId: id,
          userId: body.userId || 'usr_001',
          startTime: new Date(),
        },
      });
      return NextResponse.json({ timeEntry });
    }

    if (body.action === 'STOP') {
      const activeEntry = body.timeEntryId
        ? await db.timeEntry.findUnique({ where: { id: body.timeEntryId } })
        : await db.timeEntry.findFirst({
            where: { taskId: id, endTime: null },
            orderBy: { startTime: 'desc' },
          });

      if (!activeEntry) {
        return NextResponse.json({ error: 'No active timer found.' }, { status: 400 });
      }

      const endTime = new Date();
      const startTime = new Date(activeEntry.startTime);
      const durationSeconds = Math.max(Math.round((endTime.getTime() - startTime.getTime()) / 1000), 1);

      await db.timeEntry.update({
        where: { id: activeEntry.id },
        data: {
          endTime,
          durationSeconds,
        },
      });

      // Update accumulated totalTimeSpent on Task
      const updatedTask = await db.task.update({
        where: { id },
        data: {
          totalTimeSpent: {
            increment: durationSeconds,
          },
        },
      });

      return NextResponse.json({
        totalTimeSpent: updatedTask.totalTimeSpent,
        durationSeconds,
      });
    }

    return NextResponse.json({ error: 'Invalid timer action.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API POST /api/tasks/[id]/timer] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update time tracking.' },
      { status: 400 }
    );
  }
}
