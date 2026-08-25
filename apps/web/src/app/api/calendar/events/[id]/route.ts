/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getSettingsAuthContext,
  settingsForbiddenResponse,
} from '@/features/settings/services/settings-auth-helper';
import { calendarEventFormSchema } from '@/features/calendar/schemas/calendar-event-schemas';
import { memoryCustomEvents } from '@/features/calendar/services/calendar-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;
    const db = prisma as any;

    // Check DB Meeting
    try {
      if (db.meeting?.findUnique) {
        const meeting = await db.meeting.findUnique({
          where: { id },
          include: {
            organizer: { select: { id: true, fullName: true, email: true } },
            project: { select: { id: true, name: true, projectCode: true } },
          },
        });

        if (meeting) {
          if (meeting.companyId !== auth.companyId) {
            return settingsForbiddenResponse('Access denied: Cannot access event from another company.');
          }
          return NextResponse.json({
            event: {
              id: meeting.id,
              companyId: meeting.companyId,
              title: meeting.title,
              description: meeting.description,
              eventType: meeting.isClientVisible ? 'CLIENT_MEETING' : 'MEETING',
              status: meeting.status,
              startTime: meeting.startTime.toISOString(),
              endTime: meeting.endTime.toISOString(),
              allDay: false,
              meetingLink: meeting.meetingLink,
              linkPlatform: meeting.linkPlatform,
              isClientVisible: meeting.isClientVisible,
              organizer: meeting.organizer,
              project: meeting.project,
              originSource: 'MEETING',
            },
          });
        }
      }
    } catch {
      // Memory fallback
    }

    // Check memory store
    const list = memoryCustomEvents[auth.companyId] || [];
    const event = list.find((e) => e.id === id);

    if (event) {
      if (event.companyId !== auth.companyId) {
        return settingsForbiddenResponse('Access denied: Cannot access event from another company.');
      }
      return NextResponse.json({ event });
    }

    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  } catch (error) {
    console.error('[API GET /api/calendar/events/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch event details.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;
    const body = await request.json();
    const validated = calendarEventFormSchema.parse(body);
    const db = prisma as any;

    const startDateTime = new Date(`${validated.startDate}T${validated.startTime}:00`).toISOString();
    const endDateTime = new Date(`${validated.endDate}T${validated.endTime}:00`).toISOString();

    // Check DB Meeting
    try {
      if (db.meeting?.update) {
        const existing = await db.meeting.findUnique({ where: { id } });
        if (existing) {
          if (existing.companyId !== auth.companyId) {
            return settingsForbiddenResponse('Access denied: Cannot update event from another company.');
          }

          const updated = await db.meeting.update({
            where: { id },
            data: {
              title: validated.title,
              description: validated.description || null,
              startTime: new Date(startDateTime),
              endTime: new Date(endDateTime),
              meetingLink: validated.meetingLink || null,
              linkPlatform: validated.linkPlatform || null,
              isClientVisible: validated.isClientVisible,
              status: validated.status,
            },
            include: {
              organizer: { select: { id: true, fullName: true, email: true } },
              project: { select: { id: true, name: true, projectCode: true } },
            },
          });

          return NextResponse.json({
            event: {
              id: updated.id,
              companyId: updated.companyId,
              title: updated.title,
              description: updated.description,
              eventType: updated.isClientVisible ? 'CLIENT_MEETING' : 'MEETING',
              status: updated.status,
              startTime: updated.startTime.toISOString(),
              endTime: updated.endTime.toISOString(),
              allDay: validated.allDay,
              meetingLink: updated.meetingLink,
              linkPlatform: updated.linkPlatform,
              isClientVisible: updated.isClientVisible,
              organizer: updated.organizer,
              project: updated.project,
              originSource: 'MEETING',
            },
            message: 'Event updated successfully.',
          });
        }
      }
    } catch {
      // Memory fallback
    }

    // Update in memory store
    const list = memoryCustomEvents[auth.companyId] || [];
    const index = list.findIndex((e) => e.id === id);

    if (index !== -1) {
      if (list[index].companyId !== auth.companyId) {
        return settingsForbiddenResponse('Access denied: Cannot update event from another company.');
      }

      list[index] = {
        ...list[index],
        title: validated.title,
        description: validated.description,
        eventType: validated.eventType,
        status: validated.status,
        startTime: startDateTime,
        endTime: endDateTime,
        allDay: validated.allDay,
        location: validated.location,
        meetingLink: validated.meetingLink,
        isClientVisible: validated.isClientVisible,
        reminderMinutes: validated.reminderMinutes,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ event: list[index], message: 'Event updated successfully.' });
    }

    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  } catch (error: any) {
    console.error('[API PUT /api/calendar/events/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update calendar event.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;
    const db = prisma as any;

    // Check DB Meeting
    try {
      if (db.meeting?.delete) {
        const existing = await db.meeting.findUnique({ where: { id } });
        if (existing) {
          if (existing.companyId !== auth.companyId) {
            return settingsForbiddenResponse('Access denied: Cannot delete event from another company.');
          }
          await db.meeting.delete({ where: { id } });
          return NextResponse.json({ success: true, message: 'Event deleted successfully.' });
        }
      }
    } catch {
      // Memory fallback
    }

    // Delete in memory store
    const list = memoryCustomEvents[auth.companyId] || [];
    const index = list.findIndex((e) => e.id === id);

    if (index !== -1) {
      if (list[index].companyId !== auth.companyId) {
        return settingsForbiddenResponse('Access denied: Cannot delete event from another company.');
      }
      list.splice(index, 1);
      return NextResponse.json({ success: true, message: 'Event deleted successfully.' });
    }

    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  } catch (error) {
    console.error('[API DELETE /api/calendar/events/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete calendar event.' }, { status: 500 });
  }
}
