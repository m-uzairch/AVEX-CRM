/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type');
    const db = prisma as any;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;

    const conversations = await db.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, fullName: true } },
          },
        },
        _count: { select: { messages: true } },
      },
    });

    const enriched = conversations.map((c: any) => ({
      ...c,
      lastMessage: c.messages[0] ?? null,
    }));

    // If querying for a specific type, return single
    if (type && projectId) {
      return NextResponse.json({ conversation: enriched[0] ?? null });
    }

    return NextResponse.json({ conversations: enriched });
  } catch (error) {
    console.error('[GET /api/conversations]', error);
    return NextResponse.json({ error: 'Failed to fetch conversations.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = prisma as any;

    const project = body.projectId
      ? await db.project.findUnique({ where: { id: body.projectId }, select: { companyId: true } })
      : null;

    const conversation = await db.conversation.create({
      data: {
        companyId: project?.companyId || body.companyId || 'comp_001',
        projectId: body.projectId || null,
        type: body.type || 'PROJECT_CHAT',
        name: body.name || null,
        createdById: 'usr_001',
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/conversations]', error);
    return NextResponse.json({ error: error?.message || 'Failed to create conversation.' }, { status: 400 });
  }
}
