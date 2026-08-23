/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import { changeRequestFormSchema } from '@/features/portal/schemas/portal-schemas';

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const projectParam = searchParams.get('projectId');
    const searchParam = searchParams.get('search')?.toLowerCase().trim();

    const db = prisma as any;

    const where: any = {
      companyId,
      customerId,
    };

    if (statusParam && statusParam !== 'ALL') {
      if (statusParam === 'OPEN') {
        where.status = 'SUBMITTED';
      } else {
        where.status = statusParam;
      }
    }

    if (projectParam && projectParam !== 'ALL') {
      where.projectId = projectParam;
    }

    const allRequests = await db.changeRequest.findMany({
      where: {
        companyId,
        customerId,
      },
      include: {
        project: { select: { id: true, projectCode: true, name: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const kpis = {
      total: allRequests.length,
      open: allRequests.filter((r: any) => r.status === 'SUBMITTED' || r.status === 'OPEN').length,
      inReview: allRequests.filter((r: any) => r.status === 'UNDER_REVIEW').length,
      inProgress: allRequests.filter((r: any) => r.status === 'APPROVED' || r.status === 'IN_PROGRESS').length,
      completed: allRequests.filter((r: any) => r.status === 'COMPLETED').length,
    };

    // Filter requests
    let filteredRequests = allRequests;

    if (statusParam && statusParam !== 'ALL') {
      if (statusParam === 'OPEN') {
        filteredRequests = filteredRequests.filter((r: any) => r.status === 'SUBMITTED' || r.status === 'OPEN');
      } else {
        filteredRequests = filteredRequests.filter((r: any) => r.status === statusParam);
      }
    }

    if (projectParam && projectParam !== 'ALL') {
      filteredRequests = filteredRequests.filter((r: any) => r.projectId === projectParam);
    }

    if (searchParam) {
      filteredRequests = filteredRequests.filter((r: any) => {
        const titleMatch = r.title?.toLowerCase().includes(searchParam);
        const descMatch = r.description?.toLowerCase().includes(searchParam);
        const projMatch = r.project?.name?.toLowerCase().includes(searchParam) || r.project?.projectCode?.toLowerCase().includes(searchParam);
        return titleMatch || descMatch || projMatch;
      });
    }

    const formatted = filteredRequests.map((r: any) => {
      // Parse requestType if embedded or infer default
      let requestType = 'CHANGE_REQUEST';
      let cleanDescription = r.description || '';
      
      const typeTagMatch = cleanDescription.match(/^\[TYPE:([A-Z_]+)\]\s*/);
      if (typeTagMatch) {
        requestType = typeTagMatch[1];
        cleanDescription = cleanDescription.replace(/^\[TYPE:[A-Z_]+\]\s*/, '');
      }

      return {
        id: r.id,
        companyId: r.companyId,
        projectId: r.projectId,
        customerId: r.customerId,
        title: r.title,
        requestType,
        description: cleanDescription,
        priority: r.priority,
        status: r.status,
        attachmentUrl: r.attachmentUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        project: r.project,
      };
    });

    return NextResponse.json({
      requests: formatted,
      kpis,
    });
  } catch (error) {
    console.error('[API GET /api/portal/requests] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { client, companyId, customerId } = authContext;
    const body = await request.json();
    const validated = changeRequestFormSchema.parse(body);
    const db = prisma as any;

    // Verify the project belongs to this customer & company
    const project = await db.project.findFirst({
      where: {
        id: validated.projectId,
        companyId,
        customerId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Specified project does not belong to your company account.' },
        { status: 403 }
      );
    }

    const requestType = validated.requestType || 'CHANGE_REQUEST';
    // Embed request type cleanly in description for DB compatibility
    const storedDescription = `[TYPE:${requestType}]\n${validated.description}`;

    const newRequest = await db.changeRequest.create({
      data: {
        companyId,
        customerId,
        projectId: validated.projectId,
        title: validated.title,
        description: storedDescription,
        priority: validated.priority,
        status: 'SUBMITTED',
        attachmentUrl: validated.attachmentUrl || null,
        createdById: client.id,
      },
      include: {
        project: { select: { id: true, projectCode: true, name: true, status: true } },
      },
    });

    // Create activity log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'CLIENT_REQUEST_SUBMITTED',
          module: 'PROJECTS',
          category: 'CLIENT_PORTAL',
          entityType: 'PROJECT',
          entityId: validated.projectId,
          description: `Client submitted request "${validated.title}" (${requestType})`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json(
      {
        request: {
          id: newRequest.id,
          companyId: newRequest.companyId,
          projectId: newRequest.projectId,
          customerId: newRequest.customerId,
          title: newRequest.title,
          requestType,
          description: validated.description,
          priority: newRequest.priority,
          status: newRequest.status,
          attachmentUrl: newRequest.attachmentUrl,
          createdAt: newRequest.createdAt.toISOString(),
          updatedAt: newRequest.updatedAt.toISOString(),
          project: newRequest.project,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/portal/requests] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create change request.' },
      { status: 400 }
    );
  }
}
