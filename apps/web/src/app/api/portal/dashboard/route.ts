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

    let client = clientIdCookie
      ? await db.clientAccount.findUnique({
          where: { id: clientIdCookie },
          include: { customer: true },
        })
      : await db.clientAccount.findFirst({ include: { customer: true } });

    if (!client) {
      const customer = await db.customer.findFirst();
      if (customer) {
        client = await db.clientAccount.create({
          data: {
            companyId: customer.companyId,
            customerId: customer.id,
            email: customer.email || 'client@company.com',
            passwordHash: 'hashed_pwd',
            name: customer.name,
            phone: customer.phone,
          },
          include: { customer: true },
        });
      }
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not authenticated.' }, { status: 401 });
    }

    // Fetch projects belonging ONLY to this client's customer record
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

    const activeProjects = formattedProjects.filter((p: any) => p.status !== 'COMPLETED');
    const completedProjectsCount = formattedProjects.filter((p: any) => p.status === 'COMPLETED').length;

    // Change Requests for this client
    const changeRequests = await db.changeRequest.findMany({
      where: { customerId: client.customerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        project: { select: { id: true, projectCode: true, name: true } },
      },
    });

    return NextResponse.json({
      client,
      activeProjects,
      completedProjectsCount,
      pendingPaymentsTotal: activeProjects.reduce((acc: number, p: any) => acc + p.payments.remainingBalance, 0),
      recentChangeRequests: changeRequests,
      unreadMessagesCount: 2,
    });
  } catch (error) {
    console.error('[API GET /api/portal/dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve client portal dashboard.' },
      { status: 500 }
    );
  }
}
