import {
  CRMNotification,
  NotificationFilterOptions,
  NotificationKPIs,
} from '../types/notification-types';
import { DispatchNotificationValues } from '../schemas/notification-schemas';

export class NotificationService {
  /**
   * Fetch notifications for current user with filtering
   */
  static async getNotifications(filters: NotificationFilterOptions = {}): Promise<{
    notifications: CRMNotification[];
    kpis: NotificationKPIs;
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
    if (filters.unreadOnly) params.set('unreadOnly', 'true');
    if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);

    const res = await fetch(`/api/notifications?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch notifications');
    }
    return res.json();
  }

  /**
   * Dispatch a notification across CRM
   */
  static async dispatch(values: DispatchNotificationValues): Promise<{
    notification?: CRMNotification;
    inAppCreated: boolean;
    emailSent: boolean;
    message: string;
  }> {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dispatch notification');
    }
    return res.json();
  }

  /**
   * Mark a single notification as read or unread
   */
  static async toggleRead(id: string, read: boolean): Promise<CRMNotification> {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update notification');
    }
    const data = await res.json();
    return data.notification;
  }

  /**
   * Mark all unread notifications as read
   */
  static async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to mark all notifications as read');
    }
    return res.json();
  }

  /**
   * Delete or dismiss a notification
   */
  static async dismiss(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dismiss notification');
    }
    return res.json();
  }

  /**
   * Calculate notification KPIs
   */
  static calculateKPIs(notifications: CRMNotification[]): NotificationKPIs {
    return {
      totalCount: notifications.length,
      unreadCount: notifications.filter((n) => !n.readAt).length,
      financeCount: notifications.filter((n) => n.category === 'FINANCE').length,
      crmCount: notifications.filter((n) => n.category === 'CRM').length,
      projectsCount: notifications.filter((n) => n.category === 'PROJECTS').length,
      meetingsCount: notifications.filter((n) => n.category === 'COMMUNICATION' || n.category === 'PORTAL').length,
    };
  }
}
