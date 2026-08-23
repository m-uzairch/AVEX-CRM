/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
  portalForbiddenResponse,
} from '@/features/portal/services/portal-auth-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const { id } = await params;
    const db = prisma as any;

    const changeRequest = await db.changeRequest.findFirst({
      where: {
        id,
        companyId,
        customerId,
      },
      include: {
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!changeRequest) {
      return NextResponse.json(
        { error: 'Request not found or access denied.' },
        { status: 404 }
      );
    }

    // Parse requestType
    let requestType = 'CHANGE_REQUEST';
    let cleanDescription = changeRequest.description || '';
    const typeTagMatch = cleanDescription.match(/^\[TYPE:([A-Z_]+)\]\s*/);
    if (typeTagMatch) {
      requestType = typeTagMatch[1];
      cleanDescription = cleanDescription.replace(/^\[TYPE:[A-Z_]+\]\s*/, '');
    }

    // Fetch associated messages / responses
    const messages = await db.clientMessage.findMany({
      where: {
        companyId,
        projectId: changeRequest.projectId,
        content: {
          contains: `[REQ:${id}]`,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const responses = messages.map((m: any) => ({
      id: m.id,
      requestId: id,
      senderType: m.senderType,
      senderName: m.senderType === 'CLIENT' ? authContext.clientName : 'Support & Project Team',
      content: m.content.replace(`[REQ:${id}]\n`, '').replace(`[REQ:${id}]`, '').trim(),
      attachmentUrl: m.attachmentUrl,
      createdAt: m.createdAt.toISOString(),
    }));

    // Build timeline
    const status = changeRequest.status;
    const createdAt = changeRequest.createdAt.toISOString();
    const updatedAt = changeRequest.updatedAt.toISOString();

    const timeline = [
      {
        key: 'CREATED',
        label: 'Request Created',
        description: 'Submitted by client for assessment',
        status: 'completed',
        date: createdAt,
      },
      {
        key: 'UNDER_REVIEW',
        label: 'Under Review',
        description:
          status === 'SUBMITTED'
            ? 'Awaiting team review and estimation'
            : 'Scope and timeline under evaluation',
        status:
          status === 'SUBMITTED'
            ? 'current'
            : ['UNDER_REVIEW', 'APPROVED', 'COMPLETED'].includes(status)
            ? 'completed'
            : 'upcoming',
        date: status !== 'SUBMITTED' ? updatedAt : null,
      },
      {
        key: 'WORK_STARTED',
        label: 'Work Started',
        description:
          status === 'APPROVED' || status === 'IN_PROGRESS'
            ? 'Approved and currently in development'
            : 'Implementation of requested changes',
        status:
          status === 'APPROVED' || status === 'IN_PROGRESS'
            ? 'current'
            : status === 'COMPLETED'
            ? 'completed'
            : status === 'REJECTED'
            ? 'rejected'
            : 'upcoming',
        date: status === 'APPROVED' || status === 'COMPLETED' ? updatedAt : null,
      },
      {
        key: 'COMPLETED',
        label:
          status === 'REJECTED'
            ? 'Rejected'
            : status === 'CANCELLED'
            ? 'Cancelled'
            : 'Completed',
        description:
          status === 'COMPLETED'
            ? 'Changes completed, QA tested, and deployed'
            : status === 'REJECTED'
            ? 'Request was declined by project team'
            : status === 'CANCELLED'
            ? 'Request was cancelled by client'
            : 'Final delivery and verification',
        status:
          status === 'COMPLETED'
            ? 'completed'
            : status === 'REJECTED'
            ? 'rejected'
            : status === 'CANCELLED'
            ? 'cancelled'
            : 'upcoming',
        date: ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(status) ? updatedAt : null,
      },
    ];

    const formatted = {
      id: changeRequest.id,
      companyId: changeRequest.companyId,
      projectId: changeRequest.projectId,
      customerId: changeRequest.customerId,
      title: changeRequest.title,
      requestType,
      description: cleanDescription,
      priority: changeRequest.priority,
      status: changeRequest.status,
      attachmentUrl: changeRequest.attachmentUrl,
      createdById: changeRequest.createdById,
      createdAt,
      updatedAt,
      project: changeRequest.project,
      responses,
      timeline,
    };

    return NextResponse.json({ request: formatted });
  } catch (error) {
    console.error('[API GET /api/portal/requests/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const existing = await db.changeRequest.findFirst({
      where: {
        id,
        companyId,
        customerId,
      },
    });

    if (!existing) {
      return portalForbiddenResponse('Request not found or access denied.');
    }

    if (body.action === 'CANCEL') {
      if (existing.status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'Completed requests cannot be cancelled.' },
          { status: 400 }
        );
      }

      const updated = await db.changeRequest.update({
        where: { id },
        data: {
          status: 'REJECTED', // Using REJECTED/CANCELLED state
        },
        include: {
          project: { select: { id: true, projectCode: true, name: true, status: true } },
        },
      });

      return NextResponse.json({
        request: {
          ...updated,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API PATCH /api/portal/requests/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update request.' },
      { status: 500 }
    );
  }
}
