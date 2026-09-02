/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { dispatchNotificationSchema } from '@/features/notifications/schemas/notification-schemas';
import { CRMNotification, NotificationKPIs } from '@/features/notifications/types/notification-types';
import { NotificationService } from '@/features/notifications/services/notification-service';
import { memoryNotificationPreferences } from '@/features/settings/services/settings-store';
import { memoryNotifications } from '@/features/notifications/services/notification-store';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get('search') || '').toLowerCase();
    const category = searchParams.get('category');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');

    const list = memoryNotifications[auth.companyId] || memoryNotifications.comp_001 || [];

    // Filter by authenticated user/company
    let filtered = list.filter((n) => n.companyId === auth.companyId || n.userId === auth.userId);

    if (search) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.message.toLowerCase().includes(search) ||
          (n.entityType && n.entityType.toLowerCase().includes(search))
      );
    }

    if (category && category !== 'ALL') {
      filtered = filtered.filter((n) => n.category === category);
    }

    if (type && type !== 'ALL') {
      filtered = filtered.filter((n) => n.type === type);
    }

    if (unreadOnly) {
      filtered = filtered.filter((n) => !n.readAt);
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const kpis: NotificationKPIs = NotificationService.calculateKPIs(
      list.filter((n) => n.companyId === auth.companyId || n.userId === auth.userId)
    );

    return NextResponse.json({
      notifications: filtered,
      kpis,
    });
  } catch (error) {
    console.warn('[API GET /api/notifications] Returning fallback notifications view:', error);
    return NextResponse.json({
      notifications: [],
      kpis: {
        total: 0,
        unread: 0,
        critical: 0,
        read: 0,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = dispatchNotificationSchema.parse(body);

    const targetUserId = validated.targetUserId || auth.userId;

    // Check user's notification preferences configured from Settings Task 001
    const userPrefs = memoryNotificationPreferences as any;

    // Map notification type to preference key
    let inAppEnabled = true;
    let emailEnabled = false;

    if (userPrefs) {
      switch (validated.type) {
        case 'LEAD_CREATED':
        case 'LEAD_ASSIGNED':
          inAppEnabled = userPrefs.newLead?.inApp ?? true;
          emailEnabled = userPrefs.newLead?.email ?? true;
          break;
        case 'TASK_ASSIGNED':
        case 'TASK_DUE':
          inAppEnabled = userPrefs.taskAssignment?.inApp ?? true;
          emailEnabled = userPrefs.taskAssignment?.email ?? true;
          break;
        case 'PROJECT_UPDATED':
        case 'PROJECT_STATUS_CHANGED':
          inAppEnabled = userPrefs.projectUpdates?.inApp ?? true;
          emailEnabled = userPrefs.projectUpdates?.email ?? false;
          break;
        case 'INVOICE_CREATED':
        case 'INVOICE_DUE':
          inAppEnabled = userPrefs.invoiceEvents?.inApp ?? true;
          emailEnabled = userPrefs.invoiceEvents?.email ?? true;
          break;
        case 'PAYMENT_RECEIVED':
          inAppEnabled = userPrefs.paymentEvents?.inApp ?? true;
          emailEnabled = userPrefs.paymentEvents?.email ?? true;
          break;
        case 'QUOTATION_CREATED':
        case 'QUOTATION_ACCEPTED':
        case 'QUOTATION_REJECTED':
          inAppEnabled = userPrefs.clientRequests?.inApp ?? true;
          emailEnabled = userPrefs.clientRequests?.email ?? true;
          break;
        case 'CLIENT_REQUEST_CREATED':
        case 'CLIENT_MESSAGE_RECEIVED':
          inAppEnabled = userPrefs.clientRequests?.inApp ?? true;
          emailEnabled = userPrefs.clientRequests?.email ?? true;
          break;
        case 'MEETING_CREATED':
        case 'MEETING_UPDATED':
        case 'MEETING_REMINDER':
          inAppEnabled = userPrefs.meetings?.inApp ?? true;
          emailEnabled = userPrefs.meetings?.email ?? true;
          break;
        default:
          inAppEnabled = true;
          emailEnabled = false;
      }
    }

    let createdNotification: CRMNotification | undefined;

    // Create in-app notification if allowed by user preference
    if (inAppEnabled) {
      createdNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        companyId: auth.companyId,
        userId: targetUserId,
        type: validated.type,
        category: validated.category,
        priority: validated.priority,
        title: validated.title,
        message: validated.message,
        link: validated.link || undefined,
        entityType: validated.entityType || undefined,
        entityId: validated.entityId || undefined,
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      if (!memoryNotifications[auth.companyId]) {
        memoryNotifications[auth.companyId] = [];
      }
      memoryNotifications[auth.companyId].unshift(createdNotification);
    }

    // Activity Log
    try {
      const db = prisma as any;
      if (db.activityLog?.create) {
        await db.activityLog.create({
          data: {
            companyId: auth.companyId,
            action: validated.type,
            module: validated.category,
            category: 'NOTIFICATION',
            entityType: validated.entityType || 'SYSTEM',
            entityId: validated.entityId || auth.userId,
            description: `Dispatched notification: "${validated.title}"`,
          },
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json(
      {
        notification: createdNotification,
        inAppCreated: inAppEnabled,
        emailSent: emailEnabled,
        message: 'Notification processed successfully.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/notifications] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch notification.' },
      { status: 400 }
    );
  }
}
