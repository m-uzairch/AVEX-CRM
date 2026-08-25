import {
  CalendarEvent,
  CalendarFilterOptions,
  CalendarKPIs,
} from '../types/calendar-types';
import { CalendarEventFormValues } from '../schemas/calendar-event-schemas';

export class CalendarService {
  /**
   * Fetch aggregated CRM calendar events with filtering
   */
  static async getEvents(filters: CalendarFilterOptions = {}): Promise<{
    events: CalendarEvent[];
    kpis: CalendarKPIs;
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.eventType && filters.eventType !== 'ALL') params.set('eventType', filters.eventType);
    if (filters.projectId) params.set('projectId', filters.projectId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);

    const res = await fetch(`/api/calendar/events?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch calendar events');
    }
    return res.json();
  }

  /**
   * Create a new calendar event or meeting
   */
  static async createEvent(values: CalendarEventFormValues): Promise<CalendarEvent> {
    const res = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create calendar event');
    }
    const data = await res.json();
    return data.event;
  }

  /**
   * Get single event detail
   */
  static async getEventById(id: string): Promise<CalendarEvent> {
    const res = await fetch(`/api/calendar/events/${id}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch event details');
    }
    const data = await res.json();
    return data.event;
  }

  /**
   * Update an existing event
   */
  static async updateEvent(id: string, values: CalendarEventFormValues): Promise<CalendarEvent> {
    const res = await fetch(`/api/calendar/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update calendar event');
    }
    const data = await res.json();
    return data.event;
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/calendar/events/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete calendar event');
    }
    return res.json();
  }

  /**
   * Helper to calculate KPI summary
   */
  static calculateKPIs(events: CalendarEvent[]): CalendarKPIs {
    const now = new Date();
    return {
      totalEvents: events.length,
      upcomingMeetings: events.filter(
        (e) =>
          (e.eventType === 'MEETING' || e.eventType === 'CLIENT_MEETING') &&
          new Date(e.startTime) >= now &&
          e.status !== 'CANCELLED'
      ).length,
      projectDeadlines: events.filter((e) => e.eventType === 'PROJECT_DEADLINE' || e.eventType === 'MILESTONE').length,
      taskDeadlines: events.filter((e) => e.eventType === 'TASK').length,
      clientMeetings: events.filter((e) => e.eventType === 'CLIENT_MEETING' || e.isClientVisible).length,
    };
  }
}
