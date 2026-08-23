/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import {
  calculateProjectProgress,
  calculateFinancialSummary,
} from '@/features/projects/services/project-dashboard-service';
import {
  formatClientPhases,
  sanitizeClientTasks,
  resolveProjectNextStep,
  calculateClientTaskStats,
} from '@/features/portal/services/portal-project-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const db = prisma as any;

    const project = await db.project.findFirst({
      where: {
        id,
        companyId,
        customerId,
        deletedAt: null,
      },
      include: {
        category: { select: { name: true, color: true } },
        projectManager: { select: { fullName: true, email: true, phone: true, avatar: true } },
        milestones: { orderBy: { order: 'asc' } },
        tasks: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            labels: true,
            createdAt: true,
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project workspace not found or unauthorized.' }, { status: 404 });
    }

    const progress = calculateProjectProgress(project, project.milestones || []);
    const taskStats = calculateClientTaskStats(project, project.milestones || [], project.tasks || []);
    const financials = calculateFinancialSummary(project);
    const phases = formatClientPhases(project.milestones || []);
    const tasks = sanitizeClientTasks(project.tasks || []);
    const nextStep = resolveProjectNextStep(project, project.milestones || [], project.tasks || []);

    const formattedProject = {
      id: project.id,
      projectCode: project.projectCode,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      completionPercentage: taskStats.completionPercentage || progress.completionPercentage,
      currentPhase: progress.currentPhase,
      nextStep,
      taskStats,
      startDate: project.startDate ? (project.startDate instanceof Date ? project.startDate.toISOString() : project.startDate) : null,
      expectedCompletionDate: project.expectedCompletionDate ? (project.expectedCompletionDate instanceof Date ? project.expectedCompletionDate.toISOString() : project.expectedCompletionDate) : null,
      actualCompletionDate: project.actualCompletionDate ? (project.actualCompletionDate instanceof Date ? project.actualCompletionDate.toISOString() : project.actualCompletionDate) : null,
      lastUpdated: project.updatedAt ? (project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt) : null,
      updatedAt: project.updatedAt ? (project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt) : null,
      budget: project.budget,
      currency: project.currency || 'USD',
      category: project.category ? { name: project.category.name, color: project.category.color } : null,
      projectManager: project.projectManager,
      milestones: project.milestones || [],
      phases,
      tasks,
      payments: {
        estimatedBudget: financials.estimatedBudget,
        amountPaid: financials.paymentsReceived,
        remainingBalance: financials.remainingBalance,
        status: project.status === 'COMPLETED' ? 'PAID' : 'PENDING',
        currency: financials.currency,
      },
    };

    return NextResponse.json({ project: formattedProject });
  } catch (error) {
    console.error('[API GET /api/portal/projects/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project details.' },
      { status: 500 }
    );
  }
}

