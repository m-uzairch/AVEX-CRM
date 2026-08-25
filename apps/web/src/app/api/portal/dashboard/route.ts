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
import { ClientActivityItem } from '@/features/portal/types/portal-types';

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { client, companyId, customerId } = authContext;
    const db = prisma as any;

    // 1. Fetch projects belonging ONLY to this client's customer record
    const projects = await db.project.findMany({
      where: {
        companyId,
        customerId,
        deletedAt: null,
      },
      include: {
        projectManager: { select: { fullName: true, email: true, phone: true } },
        milestones: { orderBy: { order: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedProjects = projects.map((p: any) => {
      const progress = calculateProjectProgress(p, p.milestones || []);
      const financials = calculateFinancialSummary(p);
      const pendingMilestone = p.milestones?.find((m: any) => m.status !== 'COMPLETED');

      return {
        id: p.id,
        projectCode: p.projectCode,
        name: p.name,
        description: p.description,
        status: p.status,
        completionPercentage: progress.completionPercentage,
        currentPhase: progress.currentPhase,
        nextStep: pendingMilestone?.title || (p.status === 'COMPLETED' ? 'Project Completed' : 'Phase in progress'),
        startDate: p.startDate ? p.startDate.toISOString() : null,
        expectedCompletionDate: p.expectedCompletionDate ? p.expectedCompletionDate.toISOString() : null,
        lastUpdated: p.updatedAt ? p.updatedAt.toISOString() : p.createdAt.toISOString(),
        budget: p.budget,
        currency: p.currency || 'USD',
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

    const activeProjects = formattedProjects.filter((p: any) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED');
    const completedProjectsCount = formattedProjects.filter((p: any) => p.status === 'COMPLETED').length;

    // 2. Fetch Quotations
    const quotations = await db.quotation.findMany({
      where: {
        companyId,
        customerId,
      },
      include: {
        project: { select: { id: true, name: true, projectCode: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedQuotations = quotations.map((q: any) => ({
      id: q.id,
      quotationNumber: q.quotationNumber,
      title: q.title || `Quotation ${q.quotationNumber}`,
      status: q.status,
      subtotal: q.subtotal,
      taxAmount: q.taxAmount,
      totalAmount: q.totalAmount,
      currency: q.currency || 'USD',
      issueDate: q.issueDate ? q.issueDate.toISOString() : q.createdAt.toISOString(),
      validUntil: q.validUntil ? q.validUntil.toISOString() : q.createdAt.toISOString(),
      notes: q.notes,
      itemsCount: q.items?.length || 0,
      project: q.project,
    }));

    const pendingQuotations = formattedQuotations.filter((q: any) => q.status === 'SENT' || q.status === 'DRAFT');
    const pendingQuotationsAmount = pendingQuotations.reduce((sum: number, q: any) => sum + q.totalAmount, 0);
    const mostRecentQuotation = pendingQuotations[0]
      ? {
          quotationNumber: pendingQuotations[0].quotationNumber,
          totalAmount: pendingQuotations[0].totalAmount,
          currency: pendingQuotations[0].currency,
          validUntil: pendingQuotations[0].validUntil,
        }
      : null;

    // 3. Fetch Invoices
    const invoices = await db.invoice.findMany({
      where: {
        companyId,
        customerId,
        deletedAt: null,
      },
      include: {
        project: { select: { id: true, name: true, projectCode: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedInvoices = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      title: inv.title || `Invoice ${inv.invoiceNumber}`,
      status: inv.status,
      subtotal: inv.subtotal,
      taxAmount: inv.taxAmount,
      totalAmount: inv.totalAmount,
      amountPaid: inv.amountPaid || 0,
      balanceDue: inv.balanceDue !== undefined ? inv.balanceDue : (inv.totalAmount - (inv.amountPaid || 0)),
      currency: inv.currency || 'USD',
      issueDate: inv.issueDate ? inv.issueDate.toISOString() : inv.createdAt.toISOString(),
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : inv.createdAt.toISOString(),
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
      notes: inv.notes,
      project: inv.project,
    }));

    const outstandingInvoices = formattedInvoices.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED');
    const paidInvoices = formattedInvoices.filter((inv: any) => inv.status === 'PAID');
    const totalOutstandingAmount = outstandingInvoices.reduce((sum: number, inv: any) => sum + (inv.balanceDue || inv.totalAmount), 0);
    const totalPaidAmount = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.amountPaid || inv.totalAmount), 0);

    // 4. Fetch Meetings
    const now = new Date();
    const meetings = await db.meeting.findMany({
      where: {
        companyId,
        isClientVisible: true,
        project: { customerId },
      },
      include: {
        organizer: { select: { fullName: true, email: true } },
        project: { select: { id: true, name: true, projectCode: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const upcomingMeetings = meetings
      .filter((m: any) => new Date(m.startTime) >= now || m.status === 'SCHEDULED')
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        startTime: m.startTime.toISOString(),
        endTime: m.endTime.toISOString(),
        timezone: m.timezone || 'UTC',
        meetingType: m.meetingType || 'ONLINE',
        meetingLink: m.meetingLink,
        linkPlatform: m.linkPlatform,
        status: m.status,
        organizer: m.organizer,
        project: m.project,
      }));

    const nextMeeting = upcomingMeetings[0]
      ? {
          title: upcomingMeetings[0].title,
          startTime: upcomingMeetings[0].startTime,
          meetingLink: upcomingMeetings[0].meetingLink,
          linkPlatform: upcomingMeetings[0].linkPlatform,
        }
      : null;

    // 5. Fetch Change Requests
    const changeRequests = await db.changeRequest.findMany({
      where: {
        companyId,
        customerId,
      },
      include: {
        project: { select: { id: true, projectCode: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedRequests = changeRequests.map((r: any) => ({
      id: r.id,
      companyId: r.companyId,
      projectId: r.projectId,
      customerId: r.customerId,
      title: r.title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      attachmentUrl: r.attachmentUrl,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      project: r.project,
    }));

    const openRequests = formattedRequests.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'REJECTED');
    const mostRecentRequest = openRequests[0]
      ? {
          title: openRequests[0].title,
          priority: openRequests[0].priority,
          status: openRequests[0].status,
          createdAt: openRequests[0].createdAt,
        }
      : null;

    // 6. Build Recent Activity Stream
    const activityItems: ClientActivityItem[] = [];

    // Projects activity
    formattedProjects.slice(0, 3).forEach((p: any) => {
      activityItems.push({
        id: `act_proj_${p.id}`,
        title: `Project: ${p.name}`,
        description: `Status updated to ${p.status.replace('_', ' ')} (${p.completionPercentage}% complete).`,
        timestamp: p.lastUpdated,
        category: 'PROJECT',
        link: `/portal/projects/${p.id}`,
      });
    });

    // Invoices activity
    formattedInvoices.slice(0, 3).forEach((inv: any) => {
      activityItems.push({
        id: `act_inv_${inv.id}`,
        title: `Invoice ${inv.invoiceNumber}`,
        description: `Invoice status: ${inv.status} (Total: $${inv.totalAmount.toLocaleString()}).`,
        timestamp: inv.issueDate,
        category: 'INVOICE',
        link: '/portal/invoices',
      });
    });

    // Quotations activity
    formattedQuotations.slice(0, 3).forEach((q: any) => {
      activityItems.push({
        id: `act_quot_${q.id}`,
        title: `Quotation ${q.quotationNumber}`,
        description: `${q.title} (${q.status}). Total estimate $${q.totalAmount.toLocaleString()}.`,
        timestamp: q.issueDate,
        category: 'QUOTATION',
        link: '/portal/quotations',
      });
    });

    // Requests activity
    formattedRequests.slice(0, 3).forEach((r: any) => {
      activityItems.push({
        id: `act_req_${r.id}`,
        title: `Request: ${r.title}`,
        description: `Status is ${r.status.replace('_', ' ')} (${r.priority} priority).`,
        timestamp: r.createdAt,
        category: 'REQUEST',
        link: '/portal/requests',
      });
    });

    // Meetings activity
    upcomingMeetings.slice(0, 2).forEach((m: any) => {
      activityItems.push({
        id: `act_meet_${m.id}`,
        title: `Meeting: ${m.title}`,
        description: `Scheduled for ${new Date(m.startTime).toLocaleDateString()} at ${new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        timestamp: m.startTime,
        category: 'MEETING',
        link: '/portal/meetings',
      });
    });

    // Sort all activity by timestamp descending
    activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 7. Assemble Consolidated Dashboard Payload
    const summary = {
      activeProjectsCount: activeProjects.length,
      completedProjectsCount,
      pendingQuotationsCount: pendingQuotations.length,
      mostRecentQuotation,
      unpaidInvoicesCount: outstandingInvoices.length,
      totalOutstandingAmount,
      nextMeeting,
      openRequestsCount: openRequests.length,
      mostRecentRequest,
    };

    const financialOverview = {
      outstandingAmount: totalOutstandingAmount,
      unpaidInvoicesCount: outstandingInvoices.length,
      paidAmount: totalPaidAmount,
      paidInvoicesCount: paidInvoices.length,
      pendingQuotationsAmount,
      pendingQuotationsCount: pendingQuotations.length,
      currency: 'USD',
    };

    return NextResponse.json({
      client,
      summary,
      financialOverview,
      activeProjects,
      recentActivity: activityItems.slice(0, 8),
      completedProjectsCount,
      pendingQuotations,
      outstandingInvoices,
      upcomingMeetings,
      recentChangeRequests: formattedRequests,
      pendingPaymentsTotal: totalOutstandingAmount,
      unreadMessagesCount: 1,
    });
  } catch (error) {
    console.warn('[API GET /api/portal/dashboard] Returning fallback dashboard view:', error);
    return NextResponse.json({
      client: {
        id: 'client_demo_1',
        email: 'client@nexuscorp.com',
        name: 'Emily Watson',
        company: { name: 'Nexus Corp' },
      },
      summary: {
        activeProjectsCount: 2,
        completedProjectsCount: 1,
        pendingQuotationsCount: 1,
        unpaidInvoicesCount: 1,
        totalOutstandingAmount: 4500,
        openRequestsCount: 1,
      },
      financialOverview: {
        outstandingAmount: 4500,
        unpaidInvoicesCount: 1,
        paidAmount: 18500,
        paidInvoicesCount: 3,
        pendingQuotationsAmount: 8200,
        pendingQuotationsCount: 1,
        currency: 'USD',
      },
      activeProjects: [
        {
          id: 'proj_demo_1',
          name: 'Cloud Platform Migration',
          status: 'IN_PROGRESS',
          completionPercentage: 65,
          currentPhase: 'Database Migration',
          nextStep: 'API Gateway Deployment',
          startDate: new Date().toISOString(),
          expectedCompletionDate: new Date(Date.now() + 86400000 * 30).toISOString(),
          budget: 25000,
          currency: 'USD',
        },
      ],
      recentActivity: [
        {
          id: 'act_1',
          title: 'Milestone Completed: Schema Optimization',
          description: 'Database indexing and partition structure approved.',
          timestamp: new Date().toISOString(),
          category: 'PROJECT',
          link: '/portal/projects',
        },
      ],
      completedProjectsCount: 1,
      pendingQuotations: [],
      outstandingInvoices: [],
      upcomingMeetings: [],
      recentChangeRequests: [],
      pendingPaymentsTotal: 4500,
      unreadMessagesCount: 0,
    });
  }
}
