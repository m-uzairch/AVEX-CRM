import { describe, it, expect } from 'vitest';
import { CalendarService } from '../services/calendar-service';
import { CalendarEvent } from '../types/calendar-types';

describe('CalendarService Unit Tests', () => {
  const sampleEvents: CalendarEvent[] = [
    {
      id: 'evt_1',
      companyId: 'comp_001',
      title: 'Sprint Planning',
      eventType: 'MEETING',
      status: 'SCHEDULED',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
      allDay: false,
      isClientVisible: false,
      originSource: 'MEETING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_2',
      companyId: 'comp_001',
      title: 'Client Demo Call',
      eventType: 'CLIENT_MEETING',
      status: 'CONFIRMED',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      allDay: false,
      isClientVisible: true,
      originSource: 'MEETING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_3',
      companyId: 'comp_001',
      title: 'Target MVP Launch',
      eventType: 'PROJECT_DEADLINE',
      status: 'SCHEDULED',
      startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 5).toISOString(),
      allDay: true,
      isClientVisible: true,
      originSource: 'PROJECT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_4',
      companyId: 'comp_001',
      title: 'Submit Compliance Report',
      eventType: 'TASK',
      status: 'SCHEDULED',
      startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
      allDay: true,
      isClientVisible: false,
      originSource: 'TASK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('should accurately calculate calendar KPI counts', () => {
    const kpis = CalendarService.calculateKPIs(sampleEvents);
    expect(kpis.totalEvents).toBe(4);
    expect(kpis.upcomingMeetings).toBe(2); // evt_1 + evt_2
    expect(kpis.clientMeetings).toBe(2); // evt_2 + evt_3 (isClientVisible)
    expect(kpis.projectDeadlines).toBe(1); // evt_3
    expect(kpis.taskDeadlines).toBe(1); // evt_4
  });
});
