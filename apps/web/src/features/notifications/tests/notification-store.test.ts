import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationStore } from '../stores/notification-store';
import { NotificationService } from '../services/notification-service';
import { CRMNotification } from '../types/notification-types';

describe('Notification Zustand Store & State Sync Suite', () => {
  const mockNotifications: CRMNotification[] = [
    {
      id: 'notif_test_1',
      companyId: 'comp_001',
      userId: 'usr_001',
      type: 'PAYMENT_RECEIVED',
      category: 'FINANCE',
      priority: 'HIGH',
      title: 'Payment Received',
      message: '$5,000 received',
      readAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_test_2',
      companyId: 'comp_001',
      userId: 'usr_001',
      type: 'LEAD_ASSIGNED',
      category: 'CRM',
      priority: 'NORMAL',
      title: 'New Lead Assigned',
      message: 'Lead assigned',
      readAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_test_3',
      companyId: 'comp_001',
      userId: 'usr_001',
      type: 'TASK_DUE',
      category: 'PROJECTS',
      priority: 'URGENT',
      title: 'Task Due',
      message: 'Task is due today',
      readAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useNotificationStore.setState({
      notifications: [...mockNotifications],
      kpis: NotificationService.calculateKPIs(mockNotifications),
      isLoading: false,
      isMarkingAll: false,
      error: null,
      selectedCategory: 'ALL',
      unreadOnly: false,
      searchQuery: '',
    });
  });

  it('calculates initial unread count correctly from notifications', () => {
    const { kpis, notifications } = useNotificationStore.getState();
    expect(notifications.length).toBe(3);
    expect(kpis.unreadCount).toBe(2);
    expect(kpis.totalCount).toBe(3);
  });

  it('fetchNotifications loads and calculates KPIs from API', async () => {
    vi.spyOn(NotificationService, 'getNotifications').mockResolvedValueOnce({
      notifications: mockNotifications,
      kpis: NotificationService.calculateKPIs(mockNotifications),
    });

    await useNotificationStore.getState().fetchNotifications();
    const state = useNotificationStore.getState();
    expect(state.notifications.length).toBe(3);
    expect(state.kpis.unreadCount).toBe(2);
    expect(state.isLoading).toBe(false);
  });

  it('optimistically updates unread count on markAsRead and syncs with server', async () => {
    const updatedNotif: CRMNotification = {
      ...mockNotifications[0],
      readAt: new Date().toISOString(),
    };
    vi.spyOn(NotificationService, 'toggleRead').mockResolvedValueOnce(updatedNotif);

    const promise = useNotificationStore.getState().markAsRead('notif_test_1', true);

    // Immediate optimistic update
    expect(useNotificationStore.getState().kpis.unreadCount).toBe(1);
    expect(useNotificationStore.getState().notifications.find((n) => n.id === 'notif_test_1')?.readAt).toBeDefined();

    const result = await promise;
    expect(result.id).toBe('notif_test_1');
    expect(useNotificationStore.getState().kpis.unreadCount).toBe(1);
  });

  it('rolls back unread count and notification state on markAsRead API failure', async () => {
    vi.spyOn(NotificationService, 'toggleRead').mockRejectedValueOnce(new Error('Network failure'));

    await expect(useNotificationStore.getState().markAsRead('notif_test_1', true)).rejects.toThrow('Network failure');

    // Rolled back to original state
    const state = useNotificationStore.getState();
    expect(state.kpis.unreadCount).toBe(2);
    expect(state.notifications.find((n) => n.id === 'notif_test_1')?.readAt).toBeNull();
    expect(state.error).toBe('Network failure');
  });

  it('optimistically clears unread count to 0 on markAllAsRead', async () => {
    vi.spyOn(NotificationService, 'markAllAsRead').mockResolvedValueOnce({
      success: true,
      count: 2,
    });

    const promise = useNotificationStore.getState().markAllAsRead();

    // Immediate optimistic update
    expect(useNotificationStore.getState().kpis.unreadCount).toBe(0);
    expect(useNotificationStore.getState().notifications.every((n) => Boolean(n.readAt))).toBe(true);

    const res = await promise;
    expect(res.count).toBe(2);
    expect(useNotificationStore.getState().kpis.unreadCount).toBe(0);
  });

  it('rolls back markAllAsRead on server failure', async () => {
    vi.spyOn(NotificationService, 'markAllAsRead').mockRejectedValueOnce(new Error('Server error'));

    await expect(useNotificationStore.getState().markAllAsRead()).rejects.toThrow('Server error');

    const state = useNotificationStore.getState();
    expect(state.kpis.unreadCount).toBe(2);
    expect(state.error).toBe('Server error');
  });

  it('optimistically updates unread count on dismissNotification', async () => {
    vi.spyOn(NotificationService, 'dismiss').mockResolvedValueOnce({
      success: true,
      message: 'Dismissed',
    });

    const promise = useNotificationStore.getState().dismissNotification('notif_test_1');

    // Immediate optimistic update
    expect(useNotificationStore.getState().notifications.length).toBe(2);
    expect(useNotificationStore.getState().kpis.unreadCount).toBe(1);

    await promise;
    expect(useNotificationStore.getState().kpis.unreadCount).toBe(1);
  });

  it('adds notification and increments unread count', () => {
    useNotificationStore.getState().addNotification('New Alert', 'Test alert message');

    const state = useNotificationStore.getState();
    expect(state.notifications.length).toBe(4);
    expect(state.kpis.unreadCount).toBe(3);
    expect(state.notifications[0].title).toBe('New Alert');
  });
});
