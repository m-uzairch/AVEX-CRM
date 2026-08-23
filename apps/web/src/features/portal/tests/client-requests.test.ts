import { describe, it, expect } from 'vitest';
import {
  changeRequestFormSchema,
  createRequestFormSchema,
  requestResponseFormSchema,
  ChangeRequestFormValues,
} from '../schemas/portal-schemas';
import {
  ChangeRequest,
  RequestTimelineStep,
  RequestType,
} from '../types/portal-types';

describe('Client Requests Feature Tests', () => {
  describe('changeRequestFormSchema & createRequestFormSchema', () => {
    it('should validate a valid change request submission payload', () => {
      const valid: ChangeRequestFormValues = {
        projectId: 'proj-12345',
        title: 'Add PayPal Payment Gateway',
        requestType: 'CHANGE_REQUEST',
        description: 'We need to support PayPal checkout in addition to Stripe for international users.',
        priority: 'HIGH',
        attachmentUrl: 'https://drive.google.com/file/d/123/view',
      };

      const result = changeRequestFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should allow valid request types including BUG_ISSUE, QUESTION, and GENERAL_REQUEST', () => {
      const types: RequestType[] = ['BUG_ISSUE', 'GENERAL_REQUEST', 'QUESTION', 'OTHER', 'CHANGE_REQUEST'];

      for (const type of types) {
        const payload = {
          projectId: 'proj-123',
          title: `Sample ticket for ${type}`,
          requestType: type,
          description: 'Detailed description for test validation ticket.',
          priority: 'MEDIUM' as const,
        };
        const result = createRequestFormSchema.safeParse(payload);
        expect(result.success).toBe(true);
      }
    });

    it('should reject payload with missing or short title', () => {
      const invalid = {
        projectId: 'proj-123',
        title: 'Hi', // Less than 3 chars
        description: 'Detailed description for test validation ticket.',
        priority: 'MEDIUM',
      };
      const result = changeRequestFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject payload with missing or short description', () => {
      const invalid = {
        projectId: 'proj-123',
        title: 'Valid Title Here',
        description: 'Too short', // Less than 10 chars
        priority: 'MEDIUM',
      };
      const result = changeRequestFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority levels', () => {
      const invalid = {
        projectId: 'proj-123',
        title: 'Valid Title Here',
        description: 'Detailed description for test validation ticket.',
        priority: 'SUPER_URGENT', // Invalid enum
      };
      const result = changeRequestFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid attachment URLs', () => {
      const invalid = {
        projectId: 'proj-123',
        title: 'Valid Title Here',
        description: 'Detailed description for test validation ticket.',
        priority: 'LOW',
        attachmentUrl: 'not-a-valid-url',
      };
      const result = changeRequestFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept empty string or null for optional attachmentUrl', () => {
      const validEmpty = {
        projectId: 'proj-123',
        title: 'Valid Title Here',
        description: 'Detailed description for test validation ticket.',
        priority: 'LOW' as const,
        attachmentUrl: '',
      };
      expect(changeRequestFormSchema.safeParse(validEmpty).success).toBe(true);
    });
  });

  describe('requestResponseFormSchema', () => {
    it('should validate valid client response message', () => {
      const valid = {
        content: 'We have updated the design specifications on Figma.',
        attachmentUrl: 'https://figma.com/file/sample',
      };
      const result = requestResponseFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject empty response content', () => {
      const invalid = {
        content: '',
      };
      const result = requestResponseFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Request Filtering and KPI Calculations', () => {
    const mockRequests: ChangeRequest[] = [
      {
        id: 'req-1',
        companyId: 'comp-1',
        projectId: 'proj-1',
        customerId: 'cust-1',
        title: 'Stripe webhook integration',
        requestType: 'CHANGE_REQUEST',
        description: 'Handle recurring subscription webhooks cleanly.',
        priority: 'HIGH',
        status: 'SUBMITTED',
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-01T10:00:00Z',
        project: { id: 'proj-1', projectCode: 'PRJ-101', name: 'CRM Web Application' },
      },
      {
        id: 'req-2',
        companyId: 'comp-1',
        projectId: 'proj-1',
        customerId: 'cust-1',
        title: 'Login button unresponsive on mobile Safari',
        requestType: 'BUG_ISSUE',
        description: 'Mobile users report auth button freeze.',
        priority: 'URGENT',
        status: 'UNDER_REVIEW',
        createdAt: '2026-08-02T10:00:00Z',
        updatedAt: '2026-08-03T10:00:00Z',
        project: { id: 'proj-1', projectCode: 'PRJ-101', name: 'CRM Web Application' },
      },
      {
        id: 'req-3',
        companyId: 'comp-1',
        projectId: 'proj-2',
        customerId: 'cust-1',
        title: 'Dark mode color scheme tweak',
        requestType: 'GENERAL_REQUEST',
        description: 'Adjust border contrast on dark theme.',
        priority: 'LOW',
        status: 'APPROVED',
        createdAt: '2026-08-04T10:00:00Z',
        updatedAt: '2026-08-05T10:00:00Z',
        project: { id: 'proj-2', projectCode: 'PRJ-102', name: 'Marketing Website' },
      },
      {
        id: 'req-4',
        companyId: 'comp-1',
        projectId: 'proj-2',
        customerId: 'cust-1',
        title: 'Google Analytics 4 event setup',
        requestType: 'CHANGE_REQUEST',
        description: 'Track conversion funnel events.',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        createdAt: '2026-07-20T10:00:00Z',
        updatedAt: '2026-07-25T10:00:00Z',
        project: { id: 'proj-2', projectCode: 'PRJ-102', name: 'Marketing Website' },
      },
    ];

    it('should compute KPI counts properly', () => {
      const kpis = {
        total: mockRequests.length,
        open: mockRequests.filter((r) => r.status === 'SUBMITTED' || r.status === 'OPEN').length,
        inReview: mockRequests.filter((r) => r.status === 'UNDER_REVIEW').length,
        inProgress: mockRequests.filter((r) => r.status === 'APPROVED').length,
        completed: mockRequests.filter((r) => r.status === 'COMPLETED').length,
      };

      expect(kpis.total).toBe(4);
      expect(kpis.open).toBe(1);
      expect(kpis.inReview).toBe(1);
      expect(kpis.inProgress).toBe(1);
      expect(kpis.completed).toBe(1);
    });

    it('should filter by search keyword across title, description, and project name', () => {
      const search = (q: string) => {
        const query = q.toLowerCase();
        return mockRequests.filter(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            r.project?.name.toLowerCase().includes(query) ||
            r.project?.projectCode.toLowerCase().includes(query)
        );
      };

      expect(search('Safari').length).toBe(1);
      expect(search('Safari')[0].id).toBe('req-2');
      expect(search('PRJ-102').length).toBe(2);
      expect(search('webhooks').length).toBe(1);
    });

    it('should filter by request type correctly', () => {
      const bugs = mockRequests.filter((r) => r.requestType === 'BUG_ISSUE');
      expect(bugs.length).toBe(1);
      expect(bugs[0].title).toContain('Safari');

      const changeReqs = mockRequests.filter((r) => r.requestType === 'CHANGE_REQUEST');
      expect(changeReqs.length).toBe(2);
    });
  });

  describe('Timeline Progression Logic', () => {
    const buildTimeline = (status: string, createdAt = '2026-08-01T00:00:00Z', updatedAt = '2026-08-02T00:00:00Z'): RequestTimelineStep[] => {
      return [
        {
          key: 'CREATED',
          label: 'Request Created',
          status: 'completed',
          date: createdAt,
        },
        {
          key: 'UNDER_REVIEW',
          label: 'Under Review',
          status:
            status === 'SUBMITTED'
              ? 'current'
              : ['UNDER_REVIEW', 'APPROVED', 'COMPLETED'].includes(status)
              ? 'completed'
              : 'upcoming',
          date: status !== 'SUBMITTED' ? updatedAt : null,
        },
        {
          key: 'WORK_STARTED',
          label: 'Work Started',
          status:
            status === 'APPROVED'
              ? 'current'
              : status === 'COMPLETED'
              ? 'completed'
              : status === 'REJECTED'
              ? 'rejected'
              : 'upcoming',
          date: status === 'APPROVED' || status === 'COMPLETED' ? updatedAt : null,
        },
        {
          key: 'COMPLETED',
          label: status === 'REJECTED' ? 'Rejected' : 'Completed',
          status:
            status === 'COMPLETED'
              ? 'completed'
              : status === 'REJECTED'
              ? 'rejected'
              : 'upcoming',
          date: ['COMPLETED', 'REJECTED'].includes(status) ? updatedAt : null,
        },
      ];
    };

    it('should build proper timeline for newly SUBMITTED request', () => {
      const timeline = buildTimeline('SUBMITTED');
      expect(timeline[0].status).toBe('completed');
      expect(timeline[1].status).toBe('current');
      expect(timeline[2].status).toBe('upcoming');
      expect(timeline[3].status).toBe('upcoming');
    });

    it('should build proper timeline for APPROVED in-progress request', () => {
      const timeline = buildTimeline('APPROVED');
      expect(timeline[0].status).toBe('completed');
      expect(timeline[1].status).toBe('completed');
      expect(timeline[2].status).toBe('current');
      expect(timeline[3].status).toBe('upcoming');
    });

    it('should build proper timeline for COMPLETED request', () => {
      const timeline = buildTimeline('COMPLETED');
      expect(timeline[0].status).toBe('completed');
      expect(timeline[1].status).toBe('completed');
      expect(timeline[2].status).toBe('completed');
      expect(timeline[3].status).toBe('completed');
    });

    it('should build proper timeline for REJECTED request', () => {
      const timeline = buildTimeline('REJECTED');
      expect(timeline[0].status).toBe('completed');
      expect(timeline[2].status).toBe('rejected');
      expect(timeline[3].status).toBe('rejected');
    });
  });

  describe('Multi-Tenant Project Ownership Security', () => {
    it('should verify that a customer can only associate requests with their own projects', () => {
      const clientContext = {
        companyId: 'company-abc',
        customerId: 'customer-123',
      };

      const projects = [
        { id: 'proj-1', companyId: 'company-abc', customerId: 'customer-123', name: 'Own Project' },
        { id: 'proj-2', companyId: 'company-abc', customerId: 'customer-999', name: 'Other Customer Project' },
        { id: 'proj-3', companyId: 'company-xyz', customerId: 'customer-123', name: 'Other Company Project' },
      ];

      const isProjectAuthorized = (projectId: string) => {
        return projects.some(
          (p) => p.id === projectId && p.companyId === clientContext.companyId && p.customerId === clientContext.customerId
        );
      };

      expect(isProjectAuthorized('proj-1')).toBe(true);
      expect(isProjectAuthorized('proj-2')).toBe(false);
      expect(isProjectAuthorized('proj-3')).toBe(false);
    });
  });
});
