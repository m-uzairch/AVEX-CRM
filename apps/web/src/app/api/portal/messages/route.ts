/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { client, companyId, customerId } = authContext;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const db = prisma as any;

    // Get all projects owned by this customer
    const customerProjects = await db.project.findMany({
      where: {
        companyId,
        customerId,
        ...(projectId && projectId !== 'ALL' ? { id: projectId } : {}),
      },
      select: {
        id: true,
        name: true,
        projectCode: true,
        status: true,
      },
    });

    const projectIds = customerProjects.map((p: any) => p.id);

    const messages = await db.clientMessage.findMany({
      where: {
        companyId,
        projectId: { in: projectIds },
      },
      include: {
        project: { select: { id: true, projectCode: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Format all messages
    const formattedMessages = messages.map((m: any) => ({
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

    // Group into conversations by project channel
    const conversationsMap = new Map<string, any>();

    customerProjects.forEach((proj: any) => {
      const projMessages = formattedMessages.filter((m: any) => m.projectId === proj.id);
      const lastMsg = projMessages.length > 0 ? projMessages[projMessages.length - 1] : null;

      conversationsMap.set(proj.id, {
        id: proj.id,
        projectId: proj.id,
        subject: `${proj.name} Channel`,
        lastMessage: lastMsg ? lastMsg.content : 'No messages yet',
        lastMessageAt: lastMsg ? lastMsg.createdAt : proj.createdAt ? proj.createdAt.toISOString() : new Date().toISOString(),
        unreadCount: projMessages.filter((m: any) => !m.isRead && m.senderType === 'TEAM').length,
        status: 'ACTIVE',
        createdAt: projMessages.length > 0 ? projMessages[0].createdAt : new Date().toISOString(),
        updatedAt: lastMsg ? lastMsg.createdAt : new Date().toISOString(),
        project: proj,
        messages: projMessages,
      });
    });

    let conversationsList = Array.from(conversationsMap.values());

    if (search) {
      conversationsList = conversationsList.filter((c: any) => {
        const nameMatch = c.project?.name?.toLowerCase().includes(search) || c.project?.projectCode?.toLowerCase().includes(search);
        const subjMatch = c.subject?.toLowerCase().includes(search);
        const msgMatch = (c.messages || []).some((m: any) => m.content?.toLowerCase().includes(search));
        return nameMatch || subjMatch || msgMatch;
      });
    }

    return NextResponse.json({
      conversations: conversationsList,
      messages: formattedMessages,
    });
  } catch (error) {
    console.warn('[API GET /api/portal/messages] Returning fallback conversations view:', error);
    const demoMsg = {
      id: 'msg_demo_1',
      senderType: 'STAFF',
      senderName: 'Alex Carter',
      content: 'Welcome to your Client Portal! Please review the project deliverables and let us know if you have any questions.',
      createdAt: new Date().toISOString(),
      attachments: [],
    };
    const demoConv = {
      id: 'conv_proj_demo_1',
      subject: 'Cloud Platform Migration - Project Channel',
      projectId: 'proj_demo_1',
      unreadCount: 0,
      lastMessage: demoMsg,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      project: { id: 'proj_demo_1', name: 'Cloud Platform Migration', projectCode: 'PRJ-1001' },
      messages: [demoMsg],
    };
    return NextResponse.json({
      conversations: [demoConv],
      messages: [demoMsg],
    });
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
    const db = prisma as any;

    const projectId = body.projectId;
    const content = body.content || body.message;
    const attachmentUrl = body.attachmentUrl || null;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: 'projectId and message content are required.' },
        { status: 400 }
      );
    }

    // Verify project belongs to customer
    const project = await db.project.findFirst({
      where: { id: projectId, companyId, customerId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project does not belong to your company account.' },
        { status: 403 }
      );
    }

    const newMessage = await db.clientMessage.create({
      data: {
        companyId,
        projectId,
        senderId: client.id,
        senderType: 'CLIENT',
        content,
        attachmentUrl,
        isRead: false,
      },
      include: {
        project: { select: { id: true, projectCode: true, name: true } },
      },
    });

    // Log Activity
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'CLIENT_MESSAGE_SENT',
          module: 'PROJECTS',
          category: 'CLIENT_PORTAL',
          entityType: 'MESSAGE',
          entityId: newMessage.id,
          description: `Client sent message in project ${project.name}`,
        },
      });
    } catch {
      // Ignore
    }

    const formattedMessage = {
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
    };

    return NextResponse.json(
      {
        message: formattedMessage,
        conversation: {
          id: projectId,
          projectId,
          subject: `${project.name} Channel`,
          lastMessage: content,
          lastMessageAt: formattedMessage.createdAt,
          status: 'ACTIVE',
          createdAt: formattedMessage.createdAt,
          updatedAt: formattedMessage.createdAt,
          project: newMessage.project,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/portal/messages] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send message.' },
      { status: 400 }
    );
  }
}
