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

    const { client, companyId, customerId } = authContext;
    const { id } = await params;
    const db = prisma as any;

    // Verify project belongs to this customer
    const project = await db.project.findFirst({
      where: {
        id,
        companyId,
        customerId,
      },
      select: {
        id: true,
        name: true,
        projectCode: true,
        status: true,
        createdAt: true,
      },
    });

    if (!project) {
      return portalForbiddenResponse('Conversation channel not found or access denied.');
    }

    // Retrieve client-visible messages for this project
    const rawMessages = await db.clientMessage.findMany({
      where: {
        companyId,
        projectId: id,
      },
      include: {
        project: { select: { id: true, projectCode: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formattedMessages = rawMessages.map((m: any) => ({
      id: m.id,
      companyId: m.companyId,
      projectId: m.projectId,
      senderId: m.senderId,
      senderType: m.senderType,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
      senderName: m.senderType === 'CLIENT' ? client.name : 'Project Lead',
      project: m.project,
    }));

    const lastMsg = formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1] : null;

    const conversation = {
      id: project.id,
      projectId: project.id,
      subject: `${project.name} Channel`,
      lastMessage: lastMsg ? lastMsg.content : 'No messages yet',
      lastMessageAt: lastMsg ? lastMsg.createdAt : project.createdAt.toISOString(),
      unreadCount: formattedMessages.filter((m: any) => !m.isRead && m.senderType === 'TEAM').length,
      status: 'ACTIVE',
      createdAt: formattedMessages.length > 0 ? formattedMessages[0].createdAt : project.createdAt.toISOString(),
      updatedAt: lastMsg ? lastMsg.createdAt : project.createdAt.toISOString(),
      project,
      messages: formattedMessages,
    };

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('[API GET /api/portal/messages/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversation details.' },
      { status: 500 }
    );
  }
}

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
    const db = prisma as any;

    const content = body.content || body.message;
    const attachmentUrl = body.attachmentUrl || null;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    // Verify project belongs to customer
    const project = await db.project.findFirst({
      where: { id, companyId, customerId },
    });

    if (!project) {
      return portalForbiddenResponse('Project not found or access denied.');
    }

    const newMessage = await db.clientMessage.create({
      data: {
        companyId,
        projectId: id,
        senderId: client.id,
        senderType: 'CLIENT',
        content: content.trim(),
        attachmentUrl,
        isRead: false,
      },
      include: {
        project: { select: { id: true, projectCode: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        message: {
          id: newMessage.id,
          companyId: newMessage.companyId,
          projectId: newMessage.projectId,
          senderId: newMessage.senderId,
          senderType: newMessage.senderType,
          content: newMessage.content,
          attachmentUrl: newMessage.attachmentUrl,
          isRead: newMessage.isRead,
          createdAt: newMessage.createdAt.toISOString(),
          senderName: client.name,
          project: newMessage.project,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/portal/messages/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send reply.' },
      { status: 400 }
    );
  }
}
