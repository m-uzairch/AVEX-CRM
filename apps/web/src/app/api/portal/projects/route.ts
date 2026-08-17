/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  calculateProjectProgress,
  calculateFinancialSummary,
} from '@/features/projects/services/project-dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const db = prisma as any;

    const client = clientIdCookie
      ? await db.clientAccount.findUnique({ where: { id: clientIdCookie } })
      : await db.clientAccount.findFirst();

    if (!client) {
      return NextResponse.json({ error: 'Client not authenticated.' }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: {
        companyId: client.companyId,
        customerId: client.customerId,
      },
      include: {
        projectManager: { select: { fullName: true, email: true } },
        milestones: { orderBy: { order: 'asc' } },
      },
    });

    const formattedProjects = projects.map((p: any) => {
      const progress = calculateProjectProgress(p, p.milestones || []);
      const financials = calculateFinancialSummary(p);

      return {
        id: p.id,
        projectCode: p.projectCode,
        name: p.name,
        description: p.description,
        status: p.status,
        completionPercentage: progress.completionPercentage,
        currentPhase: progress.currentPhase,
        startDate: p.startDate,
        expectedCompletionDate: p.expectedCompletionDate,
        projectManager: p.projectManager,
        milestones: p.milestones,
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
