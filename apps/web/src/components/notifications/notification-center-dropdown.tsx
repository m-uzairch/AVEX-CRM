'use client';

import * as React from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { MOCK_NOTIFICATIONS, NotificationItemData } from '@/features/dashboard/mock-data';
import { Bell, Check, Sparkles, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationCenterDropdown() {
  const { notifications: liveNotifications, markAllRead, dismissNotification } = useNotificationStore();
  const [mockNotifications, setMockNotifications] = React.useState<NotificationItemData[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Merge live notifications with mock notifications
  const allNotifications = [...liveNotifications, ...mockNotifications];
  const unreadCount = allNotifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    markAllRead();
    setMockNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-card p-3 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-6 text-[10px] px-2"
              >
                <Check className="h-3 w-3 mr-1" /> Mark Read
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1.5">
            {allNotifications.length === 0 && (
              <div className="py-6 text-center text-muted-foreground text-xs">
                No notifications yet.
              </div>
            )}
            {allNotifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'p-2.5 rounded-md border text-xs space-y-1 transition-colors group relative',
                  n.unread ? 'bg-primary/5 border-primary/20' : 'bg-card border-border',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    {n.title.includes('Email') || n.title.includes('email') ? (
                      <Mail className="h-3 w-3 text-blue-500 shrink-0" />
                    ) : null}
                    {n.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    {/* Only allow dismissing live notifications */}
                    {liveNotifications.find((ln) => ln.id === n.id) && (
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground text-[11px] leading-normal">{n.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
