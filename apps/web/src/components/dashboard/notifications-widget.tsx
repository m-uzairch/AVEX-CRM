import * as React from 'react';
import { WidgetCard } from './widget-card';
import { MOCK_NOTIFICATIONS } from '@/features/dashboard/mock-data';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationsWidget() {
  return (
    <WidgetCard
      title="Notifications Feed"
      description="System alerts and activity updates."
      icon={<Bell className="h-4 w-4" />}
      action={
        <Button variant="ghost" size="sm" className="text-xs h-8">
          <Check className="h-3.5 w-3.5 mr-1" /> Mark All Read
        </Button>
      }
    >
      <div className="space-y-3 pt-2">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div
            key={notif.id}
            className={`p-3 rounded-md border text-xs space-y-1 transition-colors ${
              notif.unread
                ? 'bg-primary/5 border-primary/20'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center">
                {notif.unread && <span className="h-2 w-2 rounded-full bg-primary mr-1.5" />}
                {notif.title}
              </span>
              <span className="text-[10px] text-muted-foreground">{notif.time}</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-normal">
              {notif.description}
            </p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
