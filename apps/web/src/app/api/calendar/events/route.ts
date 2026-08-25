/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { calendarEventFormSchema } from '@/features/calendar/schemas/calendar-event-schemas';
import { CalendarEvent, CalendarKPIs } from '@/features/calendar/types/calendar-types';
import { CalendarService } from '@/features/calendar/services/calendar-service';
import { memoryCustomEvents } from '@/features/calendar/services/calendar-store';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get('search') || '').toLowerCase();
    const eventType = searchParams.get('eventType');
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = prisma as any;
    const aggregatedEvents: CalendarEvent[] = [];

    // 1. Fetch DB Meetings (includes Client Portal booked meetings where isClientVisible is true/false)
    try {
      if (db.meeting?.findMany) {
        const meetings = await db.meeting.findMany({
          where: {
            companyId: auth.companyId,
            ...(projectId ? { projectId } : {}),
          },
          include: {
            organizer: { select: { id: true, fullName: true, email: true } },
            project: { select: { id: true, name: true, projectCode: true } },
          },
        });

        meetings.forEach((m: any) => {
          aggregatedEvents.push({
            id: m.id,
            companyId: m.companyId,
            title: m.title,
            description: m.description || undefined,
            eventType: m.isClientVisible ? 'CLIENT_MEETING' : 'MEETING',
            status: m.status || 'SCHEDULED',
            startTime: m.startTime.toISOString ? m.startTime.toISOString() : new Date(m.startTime).toISOString(),
            endTime: m.endTime.toISOString ? m.endTime.toISOString() : new Date(m.endTime).toISOString(),
            allDay: false,
            meetingLink: m.meetingLink || undefined,
            linkPlatform: m.linkPlatform || undefined,
            isClientVisible: Boolean(m.isClientVisible),
            organizer: m.organizer ? { id: m.organizer.id, fullName: m.organizer.fullName, email: m.organizer.email } : undefined,
            project: m.project ? { id: m.project.id, name: m.project.name, projectCode: m.project.projectCode } : undefined,
            originSource: 'MEETING',
            createdAt: m.createdAt?.toISOString ? m.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: m.updatedAt?.toISOString ? m.updatedAt.toISOString() : new Date().toISOString(),
          });
        });
      }
    } catch {
      // Graceful fallback
    }

    // 2. Fetch Project Deadlines (Auto-inclusion of project start & expected completion dates)
    try {
      if (db.project?.findMany) {
        const projects = await db.project.findMany({
          where: {
            companyId: auth.companyId,
            deletedAt: null,
            ...(projectId ? { id: projectId } : {}),
          },
          select: {
            id: true,
            name: true,
            projectCode: true,
            startDate: true,
            expectedCompletionDate: true,
            status: true,
            customer: { select: { id: true, name: true, companyName: true } },
          },
        });

        projects.forEach((p: any) => {
          if (p.expectedCompletionDate) {
            const dueDate = p.expectedCompletionDate.toISOString ? p.expectedCompletionDate.toISOString() : new Date(p.expectedCompletionDate).toISOString();
            aggregatedEvents.push({
              id: `proj_deadline_${p.id}`,
              companyId: auth.companyId,
              title: `Project Deadline: ${p.name}`,
              description: `Target completion deadline for project ${p.projectCode || p.name}. Status: ${p.status}`,
              eventType: 'PROJECT_DEADLINE',
              status: p.status === 'COMPLETED' ? 'COMPLETED' : 'SCHEDULED',
              startTime: dueDate,
              endTime: dueDate,
              allDay: true,
              isClientVisible: true,
              project: { id: p.id, name: p.name, projectCode: p.projectCode },
              customer: p.customer ? { id: p.customer.id, name: p.customer.name, companyName: p.customer.companyName } : undefined,
              originSource: 'PROJECT',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // Graceful fallback
    }

    // 3. Fetch Project Milestones Due Dates
    try {
      if (db.projectMilestone?.findMany) {
        const milestones = await db.projectMilestone.findMany({
          where: {
            companyId: auth.companyId,
            deletedAt: null,
            dueDate: { not: null },
            ...(projectId ? { projectId } : {}),
          },
          include: {
            project: { select: { id: true, name: true, projectCode: true } },
          },
        });

        milestones.forEach((m: any) => {
          if (m.dueDate) {
            const milestoneDueDate = m.dueDate.toISOString ? m.dueDate.toISOString() : new Date(m.dueDate).toISOString();
            aggregatedEvents.push({
              id: `milestone_${m.id}`,
              companyId: m.companyId,
              title: `Milestone: ${m.title}`,
              description: m.description || `Milestone for ${m.project?.name || 'Project'}`,
              eventType: 'MILESTONE',
              status: m.status === 'COMPLETED' ? 'COMPLETED' : 'SCHEDULED',
              startTime: milestoneDueDate,
              endTime: milestoneDueDate,
              allDay: true,
              isClientVisible: true,
              project: m.project ? { id: m.project.id, name: m.project.name, projectCode: m.project.projectCode } : undefined,
              originSource: 'MILESTONE',
              createdAt: m.createdAt?.toISOString ? m.createdAt.toISOString() : new Date().toISOString(),
              updatedAt: m.updatedAt?.toISOString ? m.updatedAt.toISOString() : new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // Graceful fallback
    }

    // 4. Fetch Tasks Due Dates
    try {
      if (db.task?.findMany) {
        const tasks = await db.task.findMany({
          where: {
            companyId: auth.companyId,
            deletedAt: null,
            dueDate: { not: null },
            ...(projectId ? { projectId } : {}),
          },
          include: {
            project: { select: { id: true, name: true, projectCode: true } },
          },
        });

        tasks.forEach((t: any) => {
          if (t.dueDate) {
            const taskDueDate = t.dueDate.toISOString ? t.dueDate.toISOString() : new Date(t.dueDate).toISOString();
            aggregatedEvents.push({
              id: `task_${t.id}`,
              companyId: t.companyId,
              title: `Task Due: ${t.title}`,
              description: t.description || `Task deadline in ${t.project?.name || 'Project'}`,
              eventType: 'TASK',
              status: t.status === 'COMPLETED' ? 'COMPLETED' : 'SCHEDULED',
              startTime: taskDueDate,
              endTime: taskDueDate,
              allDay: true,
              isClientVisible: false,
              project: t.project ? { id: t.project.id, name: t.project.name, projectCode: t.project.projectCode } : undefined,
              relatedTaskId: t.id,
              originSource: 'TASK',
              createdAt: t.createdAt?.toISOString ? t.createdAt.toISOString() : new Date().toISOString(),
              updatedAt: t.updatedAt?.toISOString ? t.updatedAt.toISOString() : new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // Graceful fallback
    }

    // 5. In-Memory Custom Events for the Company
    const customList = memoryCustomEvents[auth.companyId] || memoryCustomEvents.comp_001 || [];
    customList.forEach((e) => {
      if (!aggregatedEvents.some((item) => item.id === e.id)) {
        aggregatedEvents.push(e);
      }
    });

    // Apply Client Filters
    let filtered = aggregatedEvents;

    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          (e.description && e.description.toLowerCase().includes(search)) ||
          (e.project && e.project.name.toLowerCase().includes(search)) ||
          (e.customer && e.customer.name.toLowerCase().includes(search)) ||
          (e.location && e.location.toLowerCase().includes(search))
      );
    }

    if (eventType && eventType !== 'ALL') {
      filtered = filtered.filter((e) => e.eventType === eventType);
    }

    if (projectId) {
      filtered = filtered.filter((e) => e.project?.id === projectId);
    }

    if (startDate) {
      const startFilter = new Date(startDate).getTime();
      filtered = filtered.filter((e) => new Date(e.endTime || e.startTime).getTime() >= startFilter);
    }

    if (endDate) {
      const endFilter = new Date(endDate).getTime();
      filtered = filtered.filter((e) => new Date(e.startTime).getTime() <= endFilter);
    }

    // Sort chronologically
    filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const kpis: CalendarKPIs = CalendarService.calculateKPIs(filtered);

    return NextResponse.json({
      events: filtered,
      kpis,
    });
  } catch (error) {
    console.error('[API GET /api/calendar/events] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = calendarEventFormSchema.parse(body);

    const startDateTime = new Date(`${validated.startDate}T${validated.startTime}:00`).toISOString();
    const endDateTime = new Date(`${validated.endDate}T${validated.endTime}:00`).toISOString();

    const newEvent: CalendarEvent = {
      id: `evt_${Date.now()}`,
      companyId: auth.companyId,
      title: validated.title,
      description: validated.description,
      eventType: validated.eventType,
      status: validated.status,
      startTime: startDateTime,
      endTime: endDateTime,
      allDay: validated.allDay,
      location: validated.location,
      meetingLink: validated.meetingLink,
      linkPlatform: validated.linkPlatform || (validated.meetingLink?.includes('zoom') ? 'Zoom' : 'Google Meet'),
      isClientVisible: validated.isClientVisible || validated.eventType === 'CLIENT_MEETING',
      organizer: {
        id: auth.userId,
        fullName: auth.fullName,
        email: auth.email,
      },
      project: validated.projectId
        ? { id: validated.projectId, name: 'Active Project', projectCode: 'PRJ-1001' }
        : undefined,
      reminderMinutes: validated.reminderMinutes,
      originSource: validated.eventType === 'MEETING' || validated.eventType === 'CLIENT_MEETING' ? 'MEETING' : 'MANUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If meeting type, also attempt creating in DB meeting model for client portal & team sync
    const db = prisma as any;
    try {
      if (db.meeting?.create && (validated.eventType === 'MEETING' || validated.eventType === 'CLIENT_MEETING')) {
        const dbMeeting = await db.meeting.create({
          data: {
            companyId: auth.companyId,
            projectId: validated.projectId || null,
            title: validated.title,
            description: validated.description || null,
            organizerId: auth.userId,
            startTime: new Date(startDateTime),
            endTime: new Date(endDateTime),
            meetingLink: validated.meetingLink || null,
            linkPlatform: newEvent.linkPlatform || null,
            isClientVisible: newEvent.isClientVisible,
            status: validated.status,
          },
        });
        newEvent.id = dbMeeting.id;
      }
    } catch {
      // Memory fallback
    }

    if (!memoryCustomEvents[auth.companyId]) {
      memoryCustomEvents[auth.companyId] = [];
    }
    memoryCustomEvents[auth.companyId].unshift(newEvent);

    return NextResponse.json({ event: newEvent, message: 'Event scheduled successfully.' }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/calendar/events] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create calendar event.' },
      { status: 400 }
    );
  }
}
