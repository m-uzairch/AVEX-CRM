/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { changeRequestFormSchema } from '@/features/portal/schemas/portal-schemas';

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

    const changeRequests = await db.changeRequest.findMany({
      where: {
        companyId: client.companyId,
        customerId: client.customerId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, projectCode: true, name: true } },
      },
    });

    return NextResponse.json({ changeRequests });
  } catch (error) {
    console.error('[API GET /api/portal/change-requests] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve change requests.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const body = await request.json();
    const validated = changeRequestFormSchema.parse(body);
    const db = prisma as any;

    const client = clientIdCookie
      ? await db.clientAccount.findUnique({ where: { id: clientIdCookie } })
      : await db.clientAccount.findFirst();

    if (!client) {
      return NextResponse.json({ error: 'Client not authenticated.' }, { status: 401 });
    }

    const changeRequest = await db.changeRequest.create({
      data: {
        companyId: client.companyId,
        projectId: validated.projectId,
        customerId: client.customerId,
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        status: 'SUBMITTED',
      },
      include: {
        project: { select: { id: true, projectCode: true, name: true } },
      },
    });

    // Log Activity
    try {
      await db.activityLog.create({
        data: {
          companyId: client.companyId,
          action: 'CHANGE_REQUEST_SUBMITTED',
          module: 'PROJECTS',
          category: 'CLIENT_PORTAL',
          entityType: 'PROJECT',
          entityId: validated.projectId,
          description: `Client submitted change request "${changeRequest.title}"`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({ changeRequest }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/portal/change-requests] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit change request.' },
      { status: 400 }
    );
  }
}
