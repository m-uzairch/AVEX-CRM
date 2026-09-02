'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/features/notifications/stores/notification-store';
import { CRMNotification } from '@/features/notifications/types/notification-types';
import { Bell, Check, Sparkles, X, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationCenterDropdown() {
  const router = useRouter();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.kpis.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);

  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchNotifications().catch(() => {});
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch {
      // Handled in store
    }
  };

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await dismissNotification(id);
    } catch {
      // Handled in store
    }
  };

  const handleItemClick = (n: CRMNotification) => {
    if (!n.readAt) {
      markAsRead(n.id, true).catch(() => {});
    }
    setIsOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotifications().catch(() => {});
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, fetchNotifications]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        type="button"
        aria-label="Notifications feed"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-84 sm:w-96 rounded-xl border border-border bg-card p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border mb-2">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
              >
                <Check className="h-3 w-3 mr-1" /> Mark Read
              </Button>
            )}
          </div>

          {/* List Items */}
          <div className="max-h-80 overflow-y-auto space-y-1.5 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.readAt;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      'p-2.5 rounded-lg border text-xs space-y-1 transition-all group relative cursor-pointer',
                      isUnread
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                        : 'bg-card border-border hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                        {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        <span className="truncate">{n.title}</span>
                      </span>
                      <button
                        onClick={(e) => handleDismiss(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5 ml-1"
                        title="Dismiss"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-normal line-clamp-2">
                      {n.message}
                    </p>
                    {n.link && (
                      <div className="text-[10px] text-primary font-medium flex items-center gap-1 pt-0.5">
                        <span>View</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with link to /notifications */}
          <div className="pt-2.5 mt-2 border-t border-border flex items-center justify-between text-xs">
            <Link
              href="/settings?tab=notifications"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground text-[11px]"
            >
              Settings
            </Link>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center text-primary font-semibold hover:underline text-[11px]"
            >
              <span>Notification Center</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
