/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const db = prisma as any;

    const where: any = {};
    if (projectId) where.projectId = projectId;

    const meetings = await db.meeting.findMany({
      where,
      orderBy: { startTime: 'desc' },
      include: {
        organizer: { select: { id: true, fullName: true, email: true } },
        participants: {
          include: { user: { select: { id: true, fullName: true, email: true, avatar: true } } },
        },
        notes: {
          include: { author: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('[GET /api/meetings]', error);
    return NextResponse.json({ error: 'Failed to fetch meetings.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = prisma as any;

    const project = body.projectId
      ? await db.project.findUnique({ where: { id: body.projectId }, select: { companyId: true } })
      : null;

    const companyId = project?.companyId || body.companyId || 'comp_001';

    const meeting = await db.meeting.create({
      data: {
        companyId,
        projectId: body.projectId || null,
        title: body.title,
        description: body.description || null,
        organizerId: 'usr_001',
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        timezone: body.timezone || 'UTC',
        meetingType: body.meetingType || 'ONLINE',
        meetingLink: body.meetingLink || null,
        linkPlatform: body.linkPlatform || null,
        isClientVisible: body.isClientVisible || false,
        status: 'SCHEDULED',
      },
      include: {
        organizer: { select: { id: true, fullName: true, email: true } },
        participants: true,
        notes: true,
      },
    });

    // Activity Log
    try {
      if (body.projectId) {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'MEETING_SCHEDULED',
            module: 'PROJECTS',
            category: 'COMMUNICATION',
            entityType: 'PROJECT',
            entityId: body.projectId,
            description: `Scheduled meeting "${meeting.title}"`,
          },
        });
      }
    } catch { /* ignore */ }

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/meetings]', error);
    return NextResponse.json({ error: error?.message || 'Failed to create meeting.' }, { status: 400 });
  }
}
