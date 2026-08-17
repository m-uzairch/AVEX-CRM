/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  calculateProjectHealth,
  calculateProjectTimeline,
  calculateProjectProgress,
  calculateFinancialSummary,
} from '@/features/projects/services/project-dashboard-service';

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
        customer: {
          select: { id: true, name: true, companyName: true, email: true, phone: true },
        },
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
        milestones: {
          orderBy: { order: 'asc' },
        },
        notes: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          include: {
            createdBy: {
              select: { id: true, fullName: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Fetch related Activity Logs for this project
    const activityLogs = await db.activityLog.findMany({
      where: {
        companyId: project.companyId,
        entityType: 'PROJECT',
        entityId: id,
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const milestones = project.milestones || [];
    const health = calculateProjectHealth(project, milestones);
    const timeline = calculateProjectTimeline(project);
    const progress = calculateProjectProgress(project, milestones);
    const financials = calculateFinancialSummary(project);

    return NextResponse.json({
      project,
      health,
      timeline,
      progress,
      financials,
      activities: activityLogs,
      notes: project.notes || [],
      milestones,
    });
  } catch (error) {
    console.error('[API GET /api/projects/[id]/dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load project dashboard.' },
      { status: 500 }
    );
  }
}
