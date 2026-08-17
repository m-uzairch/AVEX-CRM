/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.startTime !== undefined) updateData.startTime = new Date(body.startTime);
    if (body.endTime !== undefined) updateData.endTime = new Date(body.endTime);
    if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink;
    if (body.calendarEventId !== undefined) updateData.calendarEventId = body.calendarEventId;

    const meeting = await db.meeting.update({
      where: { id },
      data: updateData,
      include: {
        organizer: { select: { id: true, fullName: true, email: true } },
        participants: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
        notes: true,
      },
    });

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error('[PATCH /api/meetings/[id]]', error);
    return NextResponse.json({ error: error?.message || 'Failed to update meeting.' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    await db.meeting.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/meetings/[id]]', error);
    return NextResponse.json({ error: 'Failed to cancel meeting.' }, { status: 500 });
  }
}
