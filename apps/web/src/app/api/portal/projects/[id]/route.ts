/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  calculateProjectProgress,
  calculateFinancialSummary,
} from '@/features/projects/services/project-dashboard-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const db = prisma as any;

    const client = clientIdCookie
      ? await db.clientAccount.findUnique({ where: { id: clientIdCookie } })
      : await db.clientAccount.findFirst();

    if (!client) {
      return NextResponse.json({ error: 'Client not authenticated.' }, { status: 401 });
    }

    const project = await db.project.findFirst({
      where: {
        id,
        companyId: client.companyId,
        customerId: client.customerId,
      },
      include: {
        projectManager: { select: { fullName: true, email: true } },
        milestones: { orderBy: { order: 'asc' } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project workspace not found or unauthorized.' }, { status: 404 });
    }

    const progress = calculateProjectProgress(project, project.milestones || []);
    const financials = calculateFinancialSummary(project);

    const formattedProject = {
      id: project.id,
      projectCode: project.projectCode,
      name: project.name,
      description: project.description,
      status: project.status,
      completionPercentage: progress.completionPercentage,
      currentPhase: progress.currentPhase,
      startDate: project.startDate,
      expectedCompletionDate: project.expectedCompletionDate,
      projectManager: project.projectManager,
      milestones: project.milestones,
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
