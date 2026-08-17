/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const db = prisma as any;

    const notes = await db.customerNote.findMany({
      where: { customerId },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('[API GET /api/crm/customers/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve customer notes.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const { content, createdById, isPinned, attachments, mentions } = await request.json();
    const db = prisma as any;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note content cannot be empty.' },
        { status: 400 }
      );
    }

    const customer = await db.customer.findUnique({
      where: { id: customerId },
      select: { companyId: true, name: true, companyName: true },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    const authorId = createdById || 'user_owner';

    const note = await db.customerNote.create({
      data: {
        customerId,
        companyId: customer.companyId,
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
        companyId: customer.companyId,
        userId: authorId,
        action: 'NOTE_ADDED',
        module: 'CUSTOMERS',
        category: 'CUSTOMERS',
        entityType: 'CUSTOMER',
        entityId: customerId,
        description: `Added an internal note for customer ${customer.name} (${customer.companyName})`,
        metadata: {
          noteId: note.id,
          hasAttachments: Boolean(attachments?.length),
          mentionsCount: mentions?.length || 0,
        },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('[API POST /api/crm/customers/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add customer note.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
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

    const note = await db.customerNote.update({
      where: { id: noteId, customerId },
      data: updateData,
      include: {
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('[API PATCH /api/crm/customers/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer note.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    const db = prisma as any;

    if (!noteId) {
      return NextResponse.json(
        { error: 'noteId query parameter is required.' },
        { status: 400 }
      );
    }

    await db.customerNote.delete({
      where: { id: noteId, customerId },
    });

    return NextResponse.json({ success: true, message: 'Customer note deleted.' });
  } catch (error) {
    console.error('[API DELETE /api/crm/customers/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer note.' },
      { status: 500 }
    );
  }
}
