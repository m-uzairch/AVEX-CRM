import { describe, it, expect } from 'vitest';
import {
  calendarEventFormSchema,
  quickEventSchema,
} from '../schemas/calendar-event-schemas';

describe('Calendar Event Schemas Validation', () => {
  describe('calendarEventFormSchema', () => {
    it('should validate a valid event payload', () => {
      const result = calendarEventFormSchema.safeParse({
        title: 'Project Kickoff & Alignment',
        description: 'Review project scope and expectations.',
        eventType: 'MEETING',
        status: 'SCHEDULED',
        startDate: '2026-08-25',
        startTime: '10:00',
        endDate: '2026-08-25',
        endTime: '11:00',
        allDay: false,
        location: 'Executive Room A',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        linkPlatform: 'Google Meet',
        isClientVisible: true,
        reminderMinutes: 15,
      });
      expect(result.success).toBe(true);
    });

    it('should validate an all-day event regardless of times', () => {
      const result = calendarEventFormSchema.safeParse({
        title: 'Company Hackathon Day',
        eventType: 'EVENT',
        startDate: '2026-08-25',
        startTime: '09:00',
        endDate: '2026-08-25',
        endTime: '18:00',
        allDay: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject when end time is before start time on the same date', () => {
      const result = calendarEventFormSchema.safeParse({
        title: 'Invalid Timing Meeting',
        eventType: 'MEETING',
        startDate: '2026-08-25',
        startTime: '14:00',
        endDate: '2026-08-25',
        endTime: '10:00', // End time precedes start time
        allDay: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('End time must not occur before start time');
      }
    });

    it('should reject invalid meeting URLs', () => {
      const result = calendarEventFormSchema.safeParse({
        title: 'Broken Link Meeting',
        eventType: 'CLIENT_MEETING',
        startDate: '2026-08-25',
        startTime: '10:00',
        endDate: '2026-08-25',
        endTime: '11:00',
        allDay: false,
        meetingLink: 'not-a-valid-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('quickEventSchema', () => {
    it('should validate a quick event input', () => {
      const result = quickEventSchema.safeParse({
        title: 'Quick Call',
        startDate: '2026-08-25',
        startTime: '14:00',
        endTime: '14:30',
        eventType: 'MEETING',
      });
      expect(result.success).toBe(true);
    });
  });
});
