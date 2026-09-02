import { create } from 'zustand';
import {
  CRMNotification,
  NotificationFilterOptions,
  NotificationKPIs,
  NotificationCategory,
} from '../types/notification-types';
import { NotificationService } from '../services/notification-service';

export interface NotificationStoreState {
  notifications: CRMNotification[];
  kpis: NotificationKPIs;
  isLoading: boolean;
  isMarkingAll: boolean;
  error: string | null;
  selectedCategory: 'ALL' | NotificationCategory;
  unreadOnly: boolean;
  searchQuery: string;

  // Actions
  fetchNotifications: (filters?: NotificationFilterOptions) => Promise<void>;
  setSelectedCategory: (category: 'ALL' | NotificationCategory) => void;
  setUnreadOnly: (unreadOnly: boolean) => void;
  setSearchQuery: (query: string) => void;
  markAsRead: (id: string, read?: boolean) => Promise<CRMNotification>;
  markAllAsRead: () => Promise<{ success: boolean; count: number }>;
  dismissNotification: (id: string) => Promise<{ success: boolean; message: string }>;
  addNotification: (
    titleOrObj: string | Partial<CRMNotification>,
    description?: string
  ) => void;
}

const initialKPIs: NotificationKPIs = {
  totalCount: 0,
  unreadCount: 0,
  financeCount: 0,
  crmCount: 0,
  projectsCount: 0,
  meetingsCount: 0,
};

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  kpis: initialKPIs,
  isLoading: false,
  isMarkingAll: false,
  error: null,
  selectedCategory: 'ALL',
  unreadOnly: false,
  searchQuery: '',

  fetchNotifications: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters: NotificationFilterOptions = {
        search: filters?.search ?? get().searchQuery,
        category: filters?.category ?? get().selectedCategory,
        unreadOnly: filters?.unreadOnly ?? get().unreadOnly,
        type: filters?.type,
      };

      const data = await NotificationService.getNotifications(activeFilters);
      set({
        notifications: data.notifications,
        kpis: data.kpis,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Failed to fetch notifications',
      });
      throw err;
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  setUnreadOnly: (unreadOnly) => {
    set({ unreadOnly });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  markAsRead: async (id: string, read: boolean = true) => {
    const prevNotifications = get().notifications;
    const prevKPIs = get().kpis;

    // Optimistic Update
    const updatedNotifications = prevNotifications.map((n) =>
      n.id === id ? { ...n, readAt: read ? new Date().toISOString() : null } : n
    );
    const updatedKPIs = NotificationService.calculateKPIs(updatedNotifications);

    set({
      notifications: updatedNotifications,
      kpis: updatedKPIs,
    });

    try {
      const serverNotification = await NotificationService.toggleRead(id, read);
      // Sync with returned server notification
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? serverNotification : n
        ),
      }));
      return serverNotification;
    } catch (err: any) {
      // Rollback on failure
      set({
        notifications: prevNotifications,
        kpis: prevKPIs,
        error: err.message || 'Failed to update notification status',
      });
      throw err;
    }
  },

  markAllAsRead: async () => {
    set({ isMarkingAll: true });
    const prevNotifications = get().notifications;
    const prevKPIs = get().kpis;

    const nowIso = new Date().toISOString();
    // Optimistic Update
    const updatedNotifications = prevNotifications.map((n) => ({
      ...n,
      readAt: n.readAt || nowIso,
    }));
    const updatedKPIs = NotificationService.calculateKPIs(updatedNotifications);

    set({
      notifications: updatedNotifications,
      kpis: {
        ...updatedKPIs,
        unreadCount: 0,
      },
    });

    try {
      const res = await NotificationService.markAllAsRead();
      set({ isMarkingAll: false });
      return res;
    } catch (err: any) {
      // Rollback on failure
      set({
        notifications: prevNotifications,
        kpis: prevKPIs,
        isMarkingAll: false,
        error: err.message || 'Failed to mark all as read',
      });
      throw err;
    }
  },

  dismissNotification: async (id: string) => {
    const prevNotifications = get().notifications;
    const prevKPIs = get().kpis;

    // Optimistic Update
    const updatedNotifications = prevNotifications.filter((n) => n.id !== id);
    const updatedKPIs = NotificationService.calculateKPIs(updatedNotifications);

    set({
      notifications: updatedNotifications,
      kpis: updatedKPIs,
    });

    try {
      const res = await NotificationService.dismiss(id);
      return res;
    } catch (err: any) {
      // Rollback on failure
      set({
        notifications: prevNotifications,
        kpis: prevKPIs,
        error: err.message || 'Failed to dismiss notification',
      });
      throw err;
    }
  },

  addNotification: (titleOrObj, description) => {
    const nowIso = new Date().toISOString();
    let newNotification: CRMNotification;

    if (typeof titleOrObj === 'string') {
      newNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        companyId: 'comp_001',
        userId: 'usr_001',
        type: 'PROJECT_UPDATED',
        category: 'COMMUNICATION',
        priority: 'NORMAL',
        title: titleOrObj,
        message: description || '',
        readAt: null,
        createdAt: nowIso,
      };
    } else {
      newNotification = {
        id: titleOrObj.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        companyId: titleOrObj.companyId || 'comp_001',
        userId: titleOrObj.userId || 'usr_001',
        type: titleOrObj.type || 'PROJECT_UPDATED',
        category: titleOrObj.category || 'COMMUNICATION',
        priority: titleOrObj.priority || 'NORMAL',
        title: titleOrObj.title || 'Notification',
        message: titleOrObj.message || description || '',
        link: titleOrObj.link,
        entityType: titleOrObj.entityType,
        entityId: titleOrObj.entityId,
        readAt: titleOrObj.readAt || null,
        createdAt: titleOrObj.createdAt || nowIso,
      };
    }

    set((state) => {
      const notifications = [newNotification, ...state.notifications];
      const kpis = NotificationService.calculateKPIs(notifications);
      return { notifications, kpis };
    });
  },
}));
