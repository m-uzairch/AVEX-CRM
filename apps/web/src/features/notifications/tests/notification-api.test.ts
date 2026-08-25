import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getNotifications, POST as postNotification } from '@/app/api/notifications/route';
import {
  PATCH as patchNotification,
  DELETE as deleteNotification,
} from '@/app/api/notifications/[id]/route';
import { POST as markAllRead } from '@/app/api/notifications/mark-all-read/route';

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

describe('Notification API & Multi-Tenant Routing Suite', () => {
  let createdNotifId = '';

  it('GET /api/notifications returns user notifications and KPIs', async () => {
    const req = createMockRequest('/api/notifications');
    const res = await getNotifications(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notifications).toBeInstanceOf(Array);
    expect(data.kpis).toBeDefined();
    expect(data.kpis.totalCount).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/notifications dispatches a new in-app notification', async () => {
    const req = createMockRequest('/api/notifications', {
      method: 'POST',
      body: {
        type: 'PAYMENT_RECEIVED',
        category: 'FINANCE',
        priority: 'HIGH',
        title: 'New Client Payment: $3,200',
        message: 'Payment received for Invoice #INV-2026-0099',
        link: '/invoices',
        entityType: 'INVOICE',
        entityId: 'inv_0099',
      },
    });

    const res = await postNotification(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.notification).toBeDefined();
    expect(data.notification.title).toBe('New Client Payment: $3,200');
    expect(data.inAppCreated).toBe(true);
    createdNotifId = data.notification.id;
  });

  it('GET /api/notifications with category filter returns matching items', async () => {
    const req = createMockRequest('/api/notifications?category=FINANCE');
    const res = await getNotifications(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notifications.every((n: any) => n.category === 'FINANCE')).toBe(true);
  });

  it('PATCH /api/notifications/[id] marks a notification as read', async () => {
    const req = createMockRequest(`/api/notifications/${createdNotifId}`, {
      method: 'PATCH',
      body: { read: true },
    });
    const res = await patchNotification(req, { params: Promise.resolve({ id: createdNotifId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notification.readAt).toBeDefined();
  });

  it('POST /api/notifications/mark-all-read marks all user items as read', async () => {
    const req = createMockRequest('/api/notifications/mark-all-read', {
      method: 'POST',
    });
    const res = await markAllRead(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('DELETE /api/notifications/[id] dismisses the notification', async () => {
    const req = createMockRequest(`/api/notifications/${createdNotifId}`, {
      method: 'DELETE',
    });
    const res = await deleteNotification(req, { params: Promise.resolve({ id: createdNotifId }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
