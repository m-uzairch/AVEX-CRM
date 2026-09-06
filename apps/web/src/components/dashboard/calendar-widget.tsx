import * as React from 'react';
import { WidgetCard } from './widget-card';
import { Badge } from '@/components/ui/badge';
import { MOCK_MEETINGS } from '@/features/dashboard/mock-data';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyWidgetState } from './empty-widget-state';
import { Plus } from 'lucide-react';

export function CalendarWidget() {
  return (
    <WidgetCard
      title="Today's Meetings"
      description="Scheduled client calls and internal reviews."
      icon={<CalendarIcon className="h-4 w-4" />}
      action={
        <Link href="/calendar">
          <Button variant="ghost" size="sm" className="text-xs h-8">
            <Plus className="h-3.5 w-3.5 mr-1" /> Schedule
          </Button>
        </Link>
      }
    >
      {MOCK_MEETINGS.length === 0 ? (
        <EmptyWidgetState
          icon={<CalendarIcon className="h-5 w-5" />}
          title="No meetings scheduled"
          description="Your schedule is clear for today. Plan calls and syncs with your team."
        />
      ) : (
        <div className="space-y-3 pt-2">
          {MOCK_MEETINGS.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col space-y-1 p-3 rounded-md border border-border bg-card/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{evt.title}</span>
                <Badge variant="outline" className="text-[10px]">
                  {evt.type}
                </Badge>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {evt.time}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {evt.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
