/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const db = prisma as any;

    const notes = await db.leadNote.findMany({
      where: { leadId },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('[API GET /api/crm/leads/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve lead notes.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const { content, createdById, isPinned, attachments, mentions } = await request.json();
    const db = prisma as any;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note content cannot be empty.' },
        { status: 400 }
      );
    }

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: { companyId: true, name: true, companyName: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const authorId = createdById || 'user_owner';

    const note = await db.leadNote.create({
      data: {
        leadId,
        companyId: lead.companyId,
        content: content.trim(),
        isPinned: Boolean(isPinned),
        attachments: attachments || null,
        mentions: mentions || null,
        createdById: authorId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    });

    // Log Activity
    await db.activityLog.create({
      data: {
        companyId: lead.companyId,
        userId: authorId,
        action: 'LEAD_NOTE_ADDED',
        module: 'LEADS',
        category: 'LEADS',
        entityType: 'LEAD',
        entityId: leadId,
        description: `Added an internal note for lead ${lead.name} (${lead.companyName})`,
        metadata: {
          noteId: note.id,
          hasAttachments: Boolean(attachments?.length),
          mentionsCount: mentions?.length || 0,
        },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('[API POST /api/crm/leads/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add lead note.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const { noteId, content, isPinned, attachments, mentions } = await request.json();
    const db = prisma as any;

    if (!noteId) {
      return NextResponse.json(
        { error: 'noteId is required.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (typeof content === 'string' && content.trim().length > 0) {
      updateData.content = content.trim();
    }
    if (typeof isPinned === 'boolean') {
      updateData.isPinned = isPinned;
    }
    if (attachments !== undefined) {
      updateData.attachments = attachments;
    }
    if (mentions !== undefined) {
      updateData.mentions = mentions;
    }

    const note = await db.leadNote.update({
      where: { id: noteId, leadId },
      data: updateData,
      include: {
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('[API PATCH /api/crm/leads/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead note.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    const db = prisma as any;

    if (!noteId) {
      return NextResponse.json(
        { error: 'noteId query parameter is required.' },
        { status: 400 }
      );
    }

    await db.leadNote.delete({
      where: { id: noteId, leadId },
    });

    return NextResponse.json({ success: true, message: 'Lead note deleted.' });
  } catch (error) {
    console.error('[API DELETE /api/crm/leads/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead note.' },
      { status: 500 }
    );
  }
}
