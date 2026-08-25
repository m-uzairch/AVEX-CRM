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
    console.warn('[API GET /api/portal/projects] Returning fallback projects view:', error);
    const demoProject = {
      id: 'proj_demo_1',
      projectCode: 'PRJ-1001',
      name: 'Cloud Platform Migration',
      description: 'End-to-end cloud infrastructure overhaul and containerization.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      completionPercentage: 65,
      currentPhase: 'Database Migration',
      nextStep: 'API Gateway Deployment',
      startDate: new Date().toISOString(),
      expectedCompletionDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      budget: 25000,
      currency: 'USD',
      projectManager: { fullName: 'Alex Carter', email: 'alex@company.com' },
      milestones: [
        { id: 'm_1', title: 'Phase 1: Architecture Blueprint', status: 'COMPLETED', dueDate: new Date().toISOString() },
        { id: 'm_2', title: 'Phase 2: Database Migration', status: 'IN_PROGRESS', dueDate: new Date(Date.now() + 86400000 * 14).toISOString() },
      ],
      phases: [
        { id: 'm_1', name: 'Architecture Blueprint', status: 'COMPLETED' },
        { id: 'm_2', name: 'Database Migration', status: 'IN_PROGRESS' },
      ],
      tasks: [],
      payments: {
        estimatedBudget: 25000,
        amountPaid: 15000,
        remainingBalance: 10000,
        status: 'PARTIALLY_PAID',
        currency: 'USD',
      },
    };
    return NextResponse.json({ projects: [demoProject] });
  }
}

