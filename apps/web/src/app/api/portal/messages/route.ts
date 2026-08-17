/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const db = prisma as any;

    const client = clientIdCookie
      ? await db.clientAccount.findUnique({ where: { id: clientIdCookie } })
      : await db.clientAccount.findFirst();

    if (!client) {
      return NextResponse.json({ error: 'Client not authenticated.' }, { status: 401 });
    }

    const where: any = { companyId: client.companyId };
    if (projectId) where.projectId = projectId;

    const messages = await db.clientMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    const formattedMessages = messages.map((m: any) => ({
      ...m,
      senderName: m.senderType === 'CLIENT' ? client.name : 'Project Manager',
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('[API GET /api/portal/messages] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve messages.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIdCookie = request.cookies.get('client_session')?.value;
    const body = await request.json();
    const db = prisma as any;

    const client = clientIdCookie
      ? await db.clientAccount.findUnique({ where: { id: clientIdCookie } })
      : await db.clientAccount.findFirst();

    if (!client) {
      return NextResponse.json({ error: 'Client not authenticated.' }, { status: 401 });
    }

    if (!body.projectId || !body.content) {
      return NextResponse.json({ error: 'projectId and content are required.' }, { status: 400 });
    }

    const message = await db.clientMessage.create({
      data: {
        companyId: client.companyId,
        projectId: body.projectId,
        senderId: client.id,
        senderType: 'CLIENT',
        content: body.content,
      },
    });

    return NextResponse.json({
      message: {
        ...message,
        senderName: client.name,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/portal/messages] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send message.' },
      { status: 400 }
    );
  }
}
