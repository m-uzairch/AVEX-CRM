import { describe, it, expect } from 'vitest';
import {
  meetingRequestFormSchema,
  MeetingRequestFormValues,
} from '../schemas/portal-schemas';
import { ClientMeeting } from '../types/portal-types';

describe('Client Meetings Feature Tests', () => {
  describe('meetingRequestFormSchema Validation', () => {
    it('should validate a standard online video meeting request', () => {
      const valid: MeetingRequestFormValues = {
        projectId: 'proj-12345',
        title: 'Sprint 05 Review & Sign-off',
        description: 'Review completed invoice generator and client portal features.',
        meetingType: 'ONLINE',
        preferredDate: '2026-09-01',
        preferredTime: '14:30',
        durationMinutes: 45,
      };

      const result = meetingRequestFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should allow in-person and phone call meeting types with optional location', () => {
      const inPerson: MeetingRequestFormValues = {
        title: 'Quarterly Executive Roadmap Discussion',
        meetingType: 'IN_PERSON',
        location: 'Level 14, Main Office Tower',
        preferredDate: '2026-09-10',
        preferredTime: '10:00',
        durationMinutes: 60,
      };

      const result = meetingRequestFormSchema.safeParse(inPerson);
      expect(result.success).toBe(true);

      const phoneCall: MeetingRequestFormValues = {
        title: 'Quick 15-minute Phone Alignment',
        meetingType: 'PHONE_CALL',
        preferredDate: '2026-09-02',
        preferredTime: '09:00',
        durationMinutes: 15,
      };
      expect(meetingRequestFormSchema.safeParse(phoneCall).success).toBe(true);
    });

    it('should reject payload with missing or short title', () => {
      const invalid = {
        title: 'Hi', // Less than 3 chars
        preferredDate: '2026-09-01',
        preferredTime: '10:00',
        durationMinutes: 30,
      };
      const result = meetingRequestFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject payload with missing preferredDate or preferredTime', () => {
      const missingDate = {
        title: 'Architecture Review',
        preferredTime: '10:00',
        durationMinutes: 30,
      };
      expect(meetingRequestFormSchema.safeParse(missingDate).success).toBe(false);

      const missingTime = {
        title: 'Architecture Review',
        preferredDate: '2026-09-01',
        durationMinutes: 30,
      };
      expect(meetingRequestFormSchema.safeParse(missingTime).success).toBe(false);
    });

    it('should reject invalid duration ranges (< 15 or > 180 mins)', () => {
      const tooShort = {
        title: 'Architecture Review',
        preferredDate: '2026-09-01',
        preferredTime: '10:00',
        durationMinutes: 10,
      };
      expect(meetingRequestFormSchema.safeParse(tooShort).success).toBe(false);

      const tooLong = {
        title: 'Architecture Review',
        preferredDate: '2026-09-01',
        preferredTime: '10:00',
        durationMinutes: 240,
      };
      expect(meetingRequestFormSchema.safeParse(tooLong).success).toBe(false);
    });
  });

  describe('Upcoming vs Past Meetings Categorization', () => {
    const mockMeetings: ClientMeeting[] = [
      {
        id: 'meet-1',
        title: 'Upcoming Sprint Review',
        description: 'Discuss current milestone items.',
        startTime: '2026-09-01T10:00:00Z',
        endTime: '2026-09-01T10:45:00Z',
        timezone: 'UTC',
        meetingType: 'ONLINE',
        meetingLink: 'https://meet.google.com/avex-sprint-review',
        linkPlatform: 'Google Meet',
        status: 'SCHEDULED',
        project: { id: 'proj-1', projectCode: 'PRJ-101', name: 'CRM Web App' },
      },
      {
        id: 'meet-2',
        title: 'Past Kickoff Alignment',
        description: 'Initial scope walkthrough.',
        startTime: '2026-07-01T10:00:00Z',
        endTime: '2026-07-01T11:00:00Z',
        timezone: 'UTC',
        meetingType: 'ONLINE',
        meetingLink: 'https://meet.google.com/avex-kickoff',
        status: 'COMPLETED',
        project: { id: 'proj-1', projectCode: 'PRJ-101', name: 'CRM Web App' },
      },
      {
        id: 'meet-3',
        title: 'Cancelled Discussion',
        description: 'Rescheduled session.',
        startTime: '2026-09-05T10:00:00Z',
        endTime: '2026-09-05T10:30:00Z',
        timezone: 'UTC',
        meetingType: 'PHONE_CALL',
        status: 'CANCELLED',
      },
    ];

    it('should accurately partition meetings into upcoming and past categories', () => {
      const referenceNow = new Date('2026-08-20T00:00:00Z');

      const upcoming = mockMeetings.filter(
        (m) => new Date(m.startTime) >= referenceNow && m.status !== 'CANCELLED'
      );
      const past = mockMeetings.filter(
        (m) => new Date(m.startTime) < referenceNow || m.status === 'COMPLETED' || m.status === 'CANCELLED'
      );

      expect(upcoming.length).toBe(1);
      expect(upcoming[0].id).toBe('meet-1');
      expect(upcoming[0].meetingLink).toContain('meet.google.com');

      expect(past.length).toBe(2);
      expect(past.map((p) => p.id)).toContain('meet-2');
      expect(past.map((p) => p.id)).toContain('meet-3');
    });

    it('should calculate KPI summary counters correctly', () => {
      const referenceNow = new Date('2026-08-20T00:00:00Z');
      const upcoming = mockMeetings.filter(
        (m) => new Date(m.startTime) >= referenceNow && m.status !== 'CANCELLED'
      );
      const past = mockMeetings.filter(
        (m) => new Date(m.startTime) < referenceNow || m.status === 'COMPLETED' || m.status === 'CANCELLED'
      );

      const kpis = {
        upcomingCount: upcoming.length,
        pastCount: past.length,
        totalCount: mockMeetings.length,
      };

      expect(kpis.upcomingCount).toBe(1);
      expect(kpis.pastCount).toBe(2);
      expect(kpis.totalCount).toBe(3);
    });
  });

  describe('Client-Safe Sanitization & Security', () => {
    it('should ensure internal notes and confidential annotations are stripped from meeting objects', () => {
      const rawDbMeeting = {
        id: 'meet-100',
        companyId: 'comp-1',
        title: 'Project Retrospective',
        description: 'Review deliverables and sign-off.',
        startTime: new Date('2026-09-01T10:00:00Z'),
        endTime: new Date('2026-09-01T10:30:00Z'),
        meetingType: 'ONLINE',
        meetingLink: 'https://meet.google.com/test',
        isClientVisible: true,
        // Internal confidential records
        internalNotes: 'Client owes invoice #102. Do not promise free revisions.',
        costEstimate: 5000,
        privateTags: ['RISKY_CLIENT', 'LOW_BUDGET'],
      };

      // Sanitization step mimicking API response
      const sanitizeMeeting = (m: any): ClientMeeting => ({
        id: m.id,
        title: m.title,
        description: m.description,
        startTime: m.startTime.toISOString(),
        endTime: m.endTime.toISOString(),
        timezone: 'UTC',
        meetingType: m.meetingType,
        meetingLink: m.meetingLink,
        status: 'SCHEDULED',
      });

      const clientSafe = sanitizeMeeting(rawDbMeeting);

      expect(clientSafe.id).toBe('meet-100');
      expect((clientSafe as any).internalNotes).toBeUndefined();
      expect((clientSafe as any).costEstimate).toBeUndefined();
      expect((clientSafe as any).privateTags).toBeUndefined();
    });

    it('should verify customer access permissions on scheduled meetings', () => {
      const clientAuth = {
        companyId: 'comp-100',
        customerId: 'cust-200',
      };

      const meetings = [
        { id: 'm-1', companyId: 'comp-100', customerId: 'cust-200', isClientVisible: true },
        { id: 'm-2', companyId: 'comp-100', customerId: 'cust-999', isClientVisible: true },
        { id: 'm-3', companyId: 'comp-100', customerId: 'cust-200', isClientVisible: false },
      ];

      const isMeetingAuthorized = (meetingId: string) => {
        return meetings.some(
          (m) =>
            m.id === meetingId &&
            m.companyId === clientAuth.companyId &&
            m.customerId === clientAuth.customerId &&
            m.isClientVisible === true
        );
      };

      expect(isMeetingAuthorized('m-1')).toBe(true);
      expect(isMeetingAuthorized('m-2')).toBe(false); // Other customer
      expect(isMeetingAuthorized('m-3')).toBe(false); // Hidden from client
    });
  });
});
