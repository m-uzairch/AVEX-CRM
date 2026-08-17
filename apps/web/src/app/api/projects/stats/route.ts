/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const db = prisma as any;

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalTeamMembers,
    ] = await Promise.all([
      db.project.count({
        where: { companyId, deletedAt: null, isArchived: false },
      }),
      db.project.count({
        where: {
          companyId,
          deletedAt: null,
          isArchived: false,
          status: { in: ['PLANNING', 'PENDING', 'IN_PROGRESS', 'REVIEW'] },
        },
      }),
      db.project.count({
        where: {
          companyId,
          deletedAt: null,
          isArchived: false,
          status: 'COMPLETED',
        },
      }),
      db.project.count({
        where: {
          companyId,
          deletedAt: null,
          isArchived: false,
          status: { notIn: ['COMPLETED', 'CANCELLED', 'ARCHIVED'] },
          expectedCompletionDate: { lt: new Date() },
        },
      }),
      db.user.count({
        where: { companyId, status: 'ACTIVE' },
      }),
    ]);

    return NextResponse.json({
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalTeamMembers,
      totalTasks: 0, // Task board placeholder for Sprint 03 foundation
    });
  } catch (error) {
    console.error('[API GET /api/projects/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project stats.' },
      { status: 500 }
    );
  }
}
