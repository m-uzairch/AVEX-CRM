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

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const db = prisma as any;

    const projects = await db.project.findMany({
      where: {
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
      orderBy: { updatedAt: 'desc' },
    });

    const formattedProjects = projects.map((p: any) => {
      const progress = calculateProjectProgress(p, p.milestones || []);
      const taskStats = calculateClientTaskStats(p, p.milestones || [], p.tasks || []);
      const financials = calculateFinancialSummary(p);
      const phases = formatClientPhases(p.milestones || []);
      const tasks = sanitizeClientTasks(p.tasks || []);
      const nextStep = resolveProjectNextStep(p, p.milestones || [], p.tasks || []);

      return {
        id: p.id,
        projectCode: p.projectCode,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        completionPercentage: taskStats.completionPercentage || progress.completionPercentage,
        currentPhase: progress.currentPhase,
        nextStep,
        taskStats,
        startDate: p.startDate ? (p.startDate instanceof Date ? p.startDate.toISOString() : p.startDate) : null,
        expectedCompletionDate: p.expectedCompletionDate ? (p.expectedCompletionDate instanceof Date ? p.expectedCompletionDate.toISOString() : p.expectedCompletionDate) : null,
        actualCompletionDate: p.actualCompletionDate ? (p.actualCompletionDate instanceof Date ? p.actualCompletionDate.toISOString() : p.actualCompletionDate) : null,
        lastUpdated: p.updatedAt ? (p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt) : null,
        updatedAt: p.updatedAt ? (p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt) : null,
        budget: p.budget,
        currency: p.currency || 'USD',
        category: p.category ? { name: p.category.name, color: p.category.color } : null,
        projectManager: p.projectManager,
        milestones: p.milestones || [],
        phases,
        tasks,
        payments: {
          estimatedBudget: financials.estimatedBudget,
          amountPaid: financials.paymentsReceived,
          remainingBalance: financials.remainingBalance,
          status: p.status === 'COMPLETED' ? 'PAID' : 'PENDING',
          currency: financials.currency,
        },
      };
    });

    return NextResponse.json({ projects: formattedProjects });
  } catch (error) {
    console.error('[API GET /api/portal/projects] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve client projects.' },
      { status: 500 }
    );
  }
}

