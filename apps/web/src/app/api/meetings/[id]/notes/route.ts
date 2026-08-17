/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const meeting = await db.meeting.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found.' }, { status: 404 });
    }

    const note = await db.meetingNote.create({
      data: {
        meetingId: id,
        companyId: meeting.companyId,
        content: body.content,
        authorId: 'usr_001',
      },
      include: {
        author: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/meetings/[id]/notes]', error);
    return NextResponse.json({ error: error?.message || 'Failed to add meeting note.' }, { status: 400 });
  }
}
