/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
  portalForbiddenResponse,
} from '@/features/portal/services/portal-auth-helper';
import { requestResponseFormSchema } from '@/features/portal/schemas/portal-schemas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { client, companyId, customerId } = authContext;
    const { id } = await params;
    const body = await request.json();
    const validated = requestResponseFormSchema.parse(body);
    const db = prisma as any;

    const changeRequest = await db.changeRequest.findFirst({
      where: {
        id,
        companyId,
        customerId,
      },
    });

    if (!changeRequest) {
      return portalForbiddenResponse('Request not found or access denied.');
    }

    const newMessage = await db.clientMessage.create({
      data: {
        companyId,
        projectId: changeRequest.projectId,
        senderId: client.id,
        senderType: 'CLIENT',
        content: `[REQ:${id}]\n${validated.content}`,
        attachmentUrl: validated.attachmentUrl || null,
        isRead: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        response: {
          id: newMessage.id,
          requestId: id,
          senderType: 'CLIENT',
          senderName: client.name,
          content: validated.content,
          attachmentUrl: validated.attachmentUrl || null,
          createdAt: newMessage.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/portal/requests/[id]/responses] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit response.' },
      { status: 400 }
    );
  }
}
