/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required.' }, { status: 400 });
    }

    const db = prisma as any;
    const now = new Date();

    const milestones = await db.projectMilestone.findMany({
      where: { projectId, deletedAt: null, isArchived: false },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        startDate: true,
        dueDate: true,
        progressPercentage: true,
      },
    });

    const ganttBars = milestones
      .filter((m: any) => m.startDate && m.dueDate)
      .map((m: any) => {
        const dueDate = new Date(m.dueDate);
        const isOverdue =
          dueDate < now && m.status !== 'COMPLETED' && m.status !== 'CANCELLED';
        return {
          id: m.id,
          title: m.title,
          status: m.status,
          priority: m.priority,
          startDate: m.startDate,
          dueDate: m.dueDate,
          progressPercentage: m.progressPercentage,
          isOverdue,
        };
      });

    return NextResponse.json({ ganttBars });
  } catch (error) {
    console.error('[GET /api/milestones/gantt]', error);
    return NextResponse.json({ error: 'Failed to fetch Gantt data.' }, { status: 500 });
  }
}
