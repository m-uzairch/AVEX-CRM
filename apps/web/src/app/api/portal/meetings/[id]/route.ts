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

    const { companyId, customerId } = authContext;
    const { id } = await params;
    const db = prisma as any;

    const meeting = await db.meeting.findFirst({
      where: {
        id,
        companyId,
        isClientVisible: true,
        OR: [
          { project: { customerId } },
          { projectId: null },
        ],
      },
      include: {
        organizer: { select: { id: true, fullName: true, email: true } },
        project: { select: { id: true, name: true, projectCode: true, status: true } },
        participants: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found or access denied.' },
        { status: 404 }
      );
    }

    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000) || 30;

    const participants = (meeting.participants || []).map((p: any) => ({
      id: p.user?.id || p.id,
      name: p.user?.fullName || 'Team Member',
      email: p.user?.email || null,
      role: 'Participant',
    }));

    // Explicitly omit internal meeting notes to maintain client privacy
    const clientSafeMeeting = {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime.toISOString(),
      endTime: meeting.endTime.toISOString(),
      durationMinutes,
      timezone: meeting.timezone || 'UTC',
      meetingType: meeting.meetingType || 'ONLINE',
      meetingLink: meeting.meetingLink,
      linkPlatform: meeting.linkPlatform || (meeting.meetingLink?.includes('meet.google') ? 'Google Meet' : 'Online Video'),
      location: meeting.meetingType === 'IN_PERSON' ? 'Client HQ / On-Site' : meeting.meetingType === 'PHONE_CALL' ? 'Phone Conference' : null,
      status: meeting.status,
      organizer: meeting.organizer,
      participants,
      project: meeting.project,
    };

    return NextResponse.json({ meeting: clientSafeMeeting });
  } catch (error) {
    console.error('[API GET /api/portal/meetings/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const existing = await db.meeting.findFirst({
      where: {
        id,
        companyId,
        isClientVisible: true,
        OR: [
          { project: { customerId } },
          { projectId: null },
        ],
      },
    });

    if (!existing) {
      return portalForbiddenResponse('Meeting not found or access denied.');
    }

    if (body.action === 'CANCEL') {
      if (existing.status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'Completed meetings cannot be cancelled.' },
          { status: 400 }
        );
      }

      const updated = await db.meeting.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          organizer: { select: { id: true, fullName: true, email: true } },
          project: { select: { id: true, name: true, projectCode: true, status: true } },
        },
      });

      return NextResponse.json({
        meeting: {
          id: updated.id,
          title: updated.title,
          description: updated.description,
          startTime: updated.startTime.toISOString(),
          endTime: updated.endTime.toISOString(),
          timezone: updated.timezone,
          meetingType: updated.meetingType,
          meetingLink: updated.meetingLink,
          linkPlatform: updated.linkPlatform,
          status: updated.status,
          organizer: updated.organizer,
          project: updated.project,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API PATCH /api/portal/meetings/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update meeting.' },
      { status: 500 }
    );
  }
}
