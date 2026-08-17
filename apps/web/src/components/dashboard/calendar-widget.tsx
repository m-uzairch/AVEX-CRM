import * as React from 'react';
import { WidgetCard } from './widget-card';
import { Badge } from '@/components/ui/badge';
import { MOCK_MEETINGS } from '@/features/dashboard/mock-data';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

export function CalendarWidget() {
  return (
    <WidgetCard
      title="Today's Meetings"
      description="Scheduled client calls and internal reviews."
      icon={<CalendarIcon className="h-4 w-4" />}
    >
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
    </WidgetCard>
  );
}
