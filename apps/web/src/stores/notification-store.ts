'use client';

import { create } from 'zustand';
import { NotificationItemData } from '@/features/dashboard/mock-data';

interface NotificationStore {
  notifications: NotificationItemData[];
  addNotification: (title: string, description: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (title, description) =>
    set((state) => ({
      notifications: [
        {
          id: `notif_${Date.now()}`,
          title,
          description,
          time: 'just now',
          unread: true,
        },
        ...state.notifications,
      ],
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, unread: false })),
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
