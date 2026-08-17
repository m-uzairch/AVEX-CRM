/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    const messages = await db.message.findMany({
      where: { conversationId: id, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, fullName: true, email: true, avatar: true } },
        replyTo: {
          include: {
            sender: { select: { id: true, fullName: true } },
          },
        },
        attachments: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[GET /api/conversations/[id]/messages]', error);
    return NextResponse.json({ error: 'Failed to fetch messages.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    // Get conversation for companyId
    const conversation = await db.conversation.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const message = await db.message.create({
      data: {
        conversationId: id,
        companyId: conversation.companyId,
        senderId: 'usr_001', // Will come from auth session
        content: body.content,
        replyToId: body.replyToId || null,
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true, avatar: true } },
        replyTo: {
          include: { sender: { select: { id: true, fullName: true } } },
        },
        attachments: true,
      },
    });

    // Update conversation updatedAt
    await db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/conversations/[id]/messages]', error);
    return NextResponse.json({ error: error?.message || 'Failed to send message.' }, { status: 400 });
  }
}
