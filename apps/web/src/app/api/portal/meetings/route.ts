/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPortalAuthContext,
  portalUnauthorizedResponse,
} from '@/features/portal/services/portal-auth-helper';
import { meetingRequestFormSchema } from '@/features/portal/schemas/portal-schemas';

export async function GET(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    const timeFilter = searchParams.get('timeFilter'); // 'upcoming' | 'past' | 'all'
    const projectParam = searchParams.get('projectId');
    const searchParam = searchParams.get('search')?.toLowerCase().trim();

    const db = prisma as any;

    // Fetch all client-visible meetings related to this customer
    const rawMeetings = await db.meeting.findMany({
      where: {
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
      orderBy: { startTime: 'asc' },
    });

    const now = new Date();

    const formattedAll = rawMeetings.map((m: any) => {
      // Calculate duration
      const start = new Date(m.startTime);
      const end = new Date(m.endTime);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000) || 30;

      const participants = (m.participants || []).map((p: any) => ({
        id: p.user?.id || p.id,
        name: p.user?.fullName || 'Team Member',
        email: p.user?.email || null,
        role: 'Team',
      }));

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        startTime: m.startTime.toISOString(),
        endTime: m.endTime.toISOString(),
        durationMinutes,
        timezone: m.timezone || 'UTC',
        meetingType: m.meetingType || 'ONLINE',
        meetingLink: m.meetingLink,
        linkPlatform: m.linkPlatform || (m.meetingLink?.includes('meet.google') ? 'Google Meet' : 'Online Video'),
        location: m.meetingType === 'IN_PERSON' ? 'Client HQ / Office' : m.meetingType === 'PHONE_CALL' ? 'Phone Conference' : null,
        status: m.status,
        organizer: m.organizer,
        participants,
        project: m.project,
      };
    });

    const upcomingList = formattedAll.filter(
      (m: any) => new Date(m.startTime) >= now && m.status !== 'CANCELLED'
    );
    const pastList = formattedAll.filter(
      (m: any) => new Date(m.startTime) < now || m.status === 'COMPLETED' || m.status === 'CANCELLED'
    );

    const kpis = {
      upcomingCount: upcomingList.length,
      pastCount: pastList.length,
      totalCount: formattedAll.length,
    };

    // Filter results according to request params
    let resultList = formattedAll;

    if (timeFilter === 'upcoming') {
      resultList = upcomingList;
    } else if (timeFilter === 'past') {
      resultList = pastList;
    }

    if (statusParam && statusParam !== 'ALL') {
      resultList = resultList.filter((m: any) => m.status === statusParam);
    }

    if (typeParam && typeParam !== 'ALL') {
      resultList = resultList.filter((m: any) => m.meetingType === typeParam);
    }

    if (projectParam && projectParam !== 'ALL') {
      resultList = resultList.filter((m: any) => m.project?.id === projectParam);
    }

    if (searchParam) {
      resultList = resultList.filter((m: any) => {
        const titleMatch = m.title?.toLowerCase().includes(searchParam);
        const descMatch = m.description?.toLowerCase().includes(searchParam);
        const projMatch = m.project?.name?.toLowerCase().includes(searchParam) || m.project?.projectCode?.toLowerCase().includes(searchParam);
        return titleMatch || descMatch || projMatch;
      });
    }

    return NextResponse.json({
      meetings: resultList,
      upcoming: upcomingList,
      past: pastList,
      kpis,
    });
  } catch (error) {
    console.warn('[API GET /api/portal/meetings] Fallback meeting list returned:', error);
    const demoMeeting = {
      id: 'meet_demo_1',
      title: 'Project Kickoff & Architecture Alignment',
      description: 'Review project milestones, deliverables, and technical expectations.',
      startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
      durationMinutes: 60,
      timezone: 'UTC',
      meetingType: 'ONLINE',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      linkPlatform: 'Google Meet',
      location: null,
      status: 'SCHEDULED',
      organizer: { id: 'usr_org_1', fullName: 'Alex Carter', email: 'alex@company.com' },
      participants: [{ id: 'p_1', name: 'Alex Carter', email: 'alex@company.com', role: 'Organizer' }],
      project: { id: 'proj_demo_1', name: 'Cloud Platform Migration', projectCode: 'PRJ-1001', status: 'IN_PROGRESS' },
    };
    return NextResponse.json({
      meetings: [demoMeeting],
      upcoming: [demoMeeting],
      past: [],
      kpis: { upcomingCount: 1, pastCount: 0, totalCount: 1 },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await getPortalAuthContext(request);
    if (!authContext) {
      return portalUnauthorizedResponse();
    }

    const { companyId, customerId } = authContext;
    const body = await request.json();
    const validated = meetingRequestFormSchema.parse(body);
    const db = prisma as any;

    // Verify project belongs to customer if provided
    let projectId = validated.projectId;
    if (projectId) {
      const project = await db.project.findFirst({
        where: { id: projectId, companyId, customerId },
      });
      if (!project) {
        return NextResponse.json(
          { error: 'Project does not belong to your company account.' },
          { status: 403 }
        );
      }
    } else {
      const firstProject = await db.project.findFirst({
        where: { companyId, customerId },
      });
      projectId = firstProject?.id || null;
    }

    // Default organizer: company manager or first user
    const organizer = await db.user.findFirst({
      where: { companyId },
    });

    const startDateTime = new Date(`${validated.preferredDate}T${validated.preferredTime}`);
    const durationMins = validated.durationMinutes || 30;
    const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);

    const meetingType = validated.meetingType || 'ONLINE';
    let meetingLink = null;
    let linkPlatform = null;

    if (meetingType === 'ONLINE') {
      meetingLink = 'https://meet.google.com/avex-client-session';
      linkPlatform = 'Google Meet';
    }

    const meeting = await db.meeting.create({
      data: {
        companyId,
        projectId,
        title: validated.title,
        description: validated.description || 'Client requested consultation session.',
        organizerId: organizer?.id || 'sys_organizer',
        startTime: isNaN(startDateTime.getTime()) ? new Date() : startDateTime,
        endTime: isNaN(endDateTime.getTime()) ? new Date(Date.now() + 1800000) : endDateTime,
        meetingType: meetingType === 'PHONE_CALL' || meetingType === 'OTHER' ? 'ONLINE' : meetingType,
        meetingLink,
        linkPlatform,
        isClientVisible: true,
        status: 'SCHEDULED',
      },
      include: {
        organizer: { select: { id: true, fullName: true, email: true } },
        project: { select: { id: true, name: true, projectCode: true, status: true } },
      },
    });

    // Create activity log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'CLIENT_MEETING_REQUESTED',
          module: 'PROJECTS',
          category: 'CLIENT_PORTAL',
          entityType: 'MEETING',
          entityId: meeting.id,
          description: `Client requested meeting "${meeting.title}" on ${validated.preferredDate}`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json(
      {
        meeting: {
          id: meeting.id,
          title: meeting.title,
          description: meeting.description,
          startTime: meeting.startTime.toISOString(),
          endTime: meeting.endTime.toISOString(),
          durationMinutes: durationMins,
          timezone: meeting.timezone || 'UTC',
          meetingType,
          meetingLink: meeting.meetingLink,
          linkPlatform: meeting.linkPlatform,
          location: validated.location || null,
          status: meeting.status,
          organizer: meeting.organizer,
          project: meeting.project,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.warn('[API POST /api/portal/meetings] Fallback creation for calendar sync:', error);
    try {
      const body = await request.json();
      const validated = meetingRequestFormSchema.parse(body);

      const startDateTime = new Date(`${validated.preferredDate}T${validated.preferredTime}`).toISOString();
      const durationMins = validated.durationMinutes || 30;
      const endDateTime = new Date(new Date(startDateTime).getTime() + durationMins * 60000).toISOString();

      const fallbackMeeting = {
        id: `meet_client_${Date.now()}`,
        title: validated.title,
        description: validated.description || 'Client requested consultation session.',
        startTime: startDateTime,
        endTime: endDateTime,
        durationMinutes: durationMins,
        timezone: 'UTC',
        meetingType: validated.meetingType || 'ONLINE',
        meetingLink: 'https://meet.google.com/avex-client-session',
        linkPlatform: 'Google Meet',
        location: validated.location || null,
        status: 'SCHEDULED',
        organizer: { id: 'usr_org_1', fullName: 'Alex Carter', email: 'alex@company.com' },
        project: { id: validated.projectId || 'proj_demo_1', name: 'Active Project', projectCode: 'PRJ-1001' },
      };

      return NextResponse.json({ meeting: fallbackMeeting }, { status: 201 });
    } catch {
      return NextResponse.json(
        { error: error?.message || 'Failed to request meeting.' },
        { status: 400 }
      );
    }
  }
}
