import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getEvents, POST as postEvent } from '@/app/api/calendar/events/route';
import {
  GET as getEventById,
  PUT as putEventById,
  DELETE as deleteEventById,
} from '@/app/api/calendar/events/[id]/route';

function createMockRequest(
  url: string,
  options: { method?: string; body?: any; cookies?: Record<string, string> } = {}
) {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.cookies) {
    Object.entries(options.cookies).forEach(([k, v]) => {
      req.cookies.set(k, v);
    });
  }

  return req;
}

describe('Calendar API & Multi-Tenant Event Sync Suite', () => {
  let createdEventId = '';

  it('GET /api/calendar/events returns aggregated events and KPIs', async () => {
    const req = createMockRequest('/api/calendar/events');
    const res = await getEvents(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.events).toBeInstanceOf(Array);
    expect(data.kpis).toBeDefined();
    expect(data.kpis.totalEvents).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/calendar/events creates a new calendar event', async () => {
    const req = createMockRequest('/api/calendar/events', {
      method: 'POST',
      body: {
        title: 'Executive Architecture Review',
        description: 'Deep dive into microservices and cloud infrastructure.',
        eventType: 'MEETING',
        status: 'SCHEDULED',
        startDate: '2026-08-26',
        startTime: '11:00',
        endDate: '2026-08-26',
        endTime: '12:00',
        allDay: false,
        location: 'Virtual Conference',
        meetingLink: 'https://meet.google.com/test-arch-meeting',
        linkPlatform: 'Google Meet',
        isClientVisible: true,
        reminderMinutes: 15,
      },
    });

    const res = await postEvent(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.event).toBeDefined();
    expect(data.event.title).toBe('Executive Architecture Review');
    expect(data.event.isClientVisible).toBe(true);
    createdEventId = data.event.id;
  });

  it('GET /api/calendar/events with eventType filter returns only matching events', async () => {
    const req = createMockRequest('/api/calendar/events?eventType=FOLLOW_UP');
    const res = await getEvents(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.events.every((e: any) => e.eventType === 'FOLLOW_UP')).toBe(true);
  });

  it('GET /api/calendar/events with search filter returns matched items', async () => {
    const req = createMockRequest('/api/calendar/events?search=Architecture');
    const res = await getEvents(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.events.some((e: any) => e.title.includes('Architecture'))).toBe(true);
  });

  it('GET /api/calendar/events/[id] returns event details', async () => {
    const req = createMockRequest(`/api/calendar/events/${createdEventId}`);
    const res = await getEventById(req, { params: Promise.resolve({ id: createdEventId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.event.id).toBe(createdEventId);
    expect(data.event.title).toBe('Executive Architecture Review');
  });

  it('PUT /api/calendar/events/[id] updates event details', async () => {
    const req = createMockRequest(`/api/calendar/events/${createdEventId}`, {
      method: 'PUT',
      body: {
        title: 'Executive Architecture Review - Rescheduled',
        description: 'Updated agenda with security reviews.',
        eventType: 'MEETING',
        status: 'CONFIRMED',
        startDate: '2026-08-27',
        startTime: '14:00',
        endDate: '2026-08-27',
        endTime: '15:30',
        allDay: false,
        location: 'Virtual Conference',
        meetingLink: 'https://meet.google.com/test-arch-meeting',
        linkPlatform: 'Google Meet',
        isClientVisible: true,
        reminderMinutes: 30,
      },
    });

    const res = await putEventById(req, { params: Promise.resolve({ id: createdEventId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.event.title).toBe('Executive Architecture Review - Rescheduled');
    expect(data.event.status).toBe('CONFIRMED');
  });

  it('DELETE /api/calendar/events/[id] removes the event', async () => {
    const req = createMockRequest(`/api/calendar/events/${createdEventId}`, {
      method: 'DELETE',
    });
    const res = await deleteEventById(req, { params: Promise.resolve({ id: createdEventId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verify it is gone
    const verifyReq = createMockRequest(`/api/calendar/events/${createdEventId}`);
    const verifyRes = await getEventById(verifyReq, { params: Promise.resolve({ id: createdEventId }) });
    expect(verifyRes.status).toBe(404);
  });
});
