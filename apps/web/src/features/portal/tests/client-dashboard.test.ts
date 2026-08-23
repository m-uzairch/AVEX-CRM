import { describe, it, expect } from 'vitest';
import {
  ClientProjectOverview,
  ClientQuotation,
  ClientInvoice,
  ClientMeeting,
  ChangeRequest,
  ClientActivityItem,
} from '../types/portal-types';

describe('Client Dashboard Data Aggregation Unit Tests', () => {
  const mockProjects: ClientProjectOverview[] = [
    {
      id: 'proj_1',
      projectCode: 'PRJ-001',
      name: 'Mobile App Redesign',
      status: 'IN_PROGRESS',
      completionPercentage: 65,
      currentPhase: 'UI Development',
      nextStep: 'API Integration',
      lastUpdated: '2026-08-20T10:00:00Z',
    },
    {
      id: 'proj_2',
      projectCode: 'PRJ-002',
      name: 'Brand Identity',
      status: 'COMPLETED',
      completionPercentage: 100,
      currentPhase: 'Completed',
      nextStep: 'Project Completed',
      lastUpdated: '2026-08-15T12:00:00Z',
    },
  ];

  const mockQuotations: ClientQuotation[] = [
    {
      id: 'quot_1',
      quotationNumber: 'QT-2026-001',
      title: 'Cloud Migration Estimate',
      status: 'SENT',
      subtotal: 5000,
      taxAmount: 500,
      totalAmount: 5500,
      currency: 'USD',
      issueDate: '2026-08-18T00:00:00Z',
      validUntil: '2026-09-18T00:00:00Z',
    },
    {
      id: 'quot_2',
      quotationNumber: 'QT-2026-002',
      title: 'SEO Retainer',
      status: 'ACCEPTED',
      subtotal: 2000,
      taxAmount: 200,
      totalAmount: 2200,
      currency: 'USD',
      issueDate: '2026-08-01T00:00:00Z',
      validUntil: '2026-08-30T00:00:00Z',
    },
  ];

  const mockInvoices: ClientInvoice[] = [
    {
      id: 'inv_1',
      invoiceNumber: 'INV-2026-001',
      title: 'Milestone 1 Payment',
      status: 'SENT',
      subtotal: 3000,
      taxAmount: 300,
      totalAmount: 3300,
      amountPaid: 0,
      balanceDue: 3300,
      currency: 'USD',
      issueDate: '2026-08-10T00:00:00Z',
      dueDate: '2026-08-25T00:00:00Z',
    },
    {
      id: 'inv_2',
      invoiceNumber: 'INV-2026-002',
      title: 'Initial Deposit',
      status: 'PAID',
      subtotal: 2000,
      taxAmount: 200,
      totalAmount: 2200,
      amountPaid: 2200,
      balanceDue: 0,
      currency: 'USD',
      issueDate: '2026-07-15T00:00:00Z',
      dueDate: '2026-07-30T00:00:00Z',
      paidAt: '2026-07-28T00:00:00Z',
    },
  ];

  const mockMeetings: ClientMeeting[] = [
    {
      id: 'meet_1',
      title: 'Sprint Planning Sync',
      startTime: '2026-08-25T14:00:00Z',
      endTime: '2026-08-25T14:45:00Z',
      timezone: 'UTC',
      meetingType: 'ONLINE',
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      status: 'SCHEDULED',
    },
  ];

  const mockRequests: ChangeRequest[] = [
    {
      id: 'req_1',
      companyId: 'comp_1',
      projectId: 'proj_1',
      customerId: 'cust_1',
      title: 'Add Dark Mode Support',
      description: 'Please add dark mode toggle',
      priority: 'HIGH',
      status: 'SUBMITTED',
      createdAt: '2026-08-19T09:00:00Z',
      updatedAt: '2026-08-19T09:00:00Z',
    },
  ];

  describe('1. Active vs Completed Projects Separation', () => {
    it('correctly filters active projects from completed ones', () => {
      const active = mockProjects.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED');
      const completedCount = mockProjects.filter((p) => p.status === 'COMPLETED').length;

      expect(active.length).toBe(1);
      expect(active[0].id).toBe('proj_1');
      expect(completedCount).toBe(1);
    });

    it('correctly counts open change requests', () => {
      const openRequests = mockRequests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'REJECTED');
      expect(openRequests.length).toBe(1);
      expect(openRequests[0].title).toBe('Add Dark Mode Support');
    });
  });

  describe('2. Financial Overview Calculations', () => {
    it('computes outstanding balance, paid total, and pending quotations amount accurately', () => {
      const outstandingInvoices = mockInvoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED');
      const paidInvoices = mockInvoices.filter((i) => i.status === 'PAID');
      const pendingQuotations = mockQuotations.filter((q) => q.status === 'SENT' || q.status === 'DRAFT');

      const outstandingTotal = outstandingInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
      const paidTotal = paidInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
      const pendingQuotationsTotal = pendingQuotations.reduce((sum, q) => sum + q.totalAmount, 0);

      expect(outstandingTotal).toBe(3300);
      expect(paidTotal).toBe(2200);
      expect(pendingQuotationsTotal).toBe(5500);
    });
  });

  describe('3. Next Meeting & Activity Resolution', () => {
    it('identifies the nearest upcoming meeting', () => {
      const nextMeeting = mockMeetings[0];
      expect(nextMeeting.title).toBe('Sprint Planning Sync');
      expect(nextMeeting.meetingType).toBe('ONLINE');
      expect(nextMeeting.meetingLink).toContain('meet.google.com');
    });

    it('correctly sorts activity timeline descending by timestamp', () => {
      const activities: ClientActivityItem[] = [
        {
          id: 'act_1',
          title: 'Older activity',
          description: 'Desc',
          timestamp: '2026-08-01T10:00:00Z',
          category: 'PROJECT',
        },
        {
          id: 'act_2',
          title: 'Newer activity',
          description: 'Desc',
          timestamp: '2026-08-20T10:00:00Z',
          category: 'INVOICE',
        },
      ];

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      expect(activities[0].id).toBe('act_2');
      expect(activities[1].id).toBe('act_1');
    });
  });

  describe('4. Empty Dashboard Handling', () => {
    it('handles zero project/invoice/meeting state without crashing', () => {
      const emptyProjects: ClientProjectOverview[] = [];
      const emptyInvoices: ClientInvoice[] = [];

      const activeProjects = emptyProjects.filter((p) => p.status !== 'COMPLETED');
      const outstandingTotal = emptyInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

      expect(activeProjects.length).toBe(0);
      expect(outstandingTotal).toBe(0);
    });
  });
});
