import { describe, it, expect } from 'vitest';
import { NotificationService } from '../services/notification-service';
import { CRMNotification } from '../types/notification-types';

describe('NotificationService Unit Tests', () => {
  const sampleNotifications: CRMNotification[] = [
    {
      id: 'notif_1',
      companyId: 'comp_001',
      userId: 'usr_001',
      type: 'PAYMENT_RECEIVED',
      category: 'FINANCE',
      priority: 'HIGH',
      title: 'Payment Received',
      message: '$2,000 received',
      readAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_2',
      companyId: 'comp_001',
      userId: 'usr_001',
      type: 'LEAD_ASSIGNED',
      category: 'CRM',
      priority: 'NORMAL',
      title: 'New Lead',
      message: 'Lead assigned',
      readAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_3',
      companyId: 'comp_001',
      userId: 'usr_001',
      type: 'TASK_DUE',
      category: 'PROJECTS',
      priority: 'URGENT',
      title: 'Task Due',
      message: 'Task is due today',
      readAt: null,
      createdAt: new Date().toISOString(),
    },
  ];

  it('should accurately calculate notification KPI metrics', () => {
    const kpis = NotificationService.calculateKPIs(sampleNotifications);
    expect(kpis.totalCount).toBe(3);
    expect(kpis.unreadCount).toBe(2);
    expect(kpis.financeCount).toBe(1);
    expect(kpis.crmCount).toBe(1);
    expect(kpis.projectsCount).toBe(1);
  });
});
