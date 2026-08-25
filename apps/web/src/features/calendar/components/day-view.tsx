'use client';

import * as React from 'react';
import { CalendarEvent } from '../types/calendar-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Video,
  Users,
  Flag,
  CheckSquare,
  PhoneCall,
  Clock,
  MapPin,
  ExternalLink,
  Calendar as CalendarIcon,
  FolderKanban,
  User,
} from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenCreateDialog: () => void;
}

export function DayView({
  currentDate,
  events,
  onSelectEvent,
  onOpenCreateDialog,
}: DayViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  // Events for today
  const dayEvents = events.filter((e) => {
    const start = new Date(e.startTime);
    return (
      start.getFullYear() === year &&
      start.getMonth() === month &&
      start.getDate() === day
    );
  });

  const getEventBadgeStyles = (eventType: string) => {
    switch (eventType) {
      case 'CLIENT_MEETING':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'MEETING':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'PROJECT_DEADLINE':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'MILESTONE':
        return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
      case 'TASK':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'FOLLOW_UP':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      default:
        return 'bg-primary/15 text-primary border-primary/30';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CLIENT_MEETING':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'MEETING':
        return <Users className="h-4 w-4 text-emerald-500" />;
      case 'PROJECT_DEADLINE':
      case 'MILESTONE':
        return <Flag className="h-4 w-4 text-purple-500" />;
      case 'TASK':
        return <CheckSquare className="h-4 w-4 text-amber-500" />;
      case 'FOLLOW_UP':
        return <PhoneCall className="h-4 w-4 text-rose-500" />;
      default:
        return <CalendarIcon className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Detailed Events List */}
      <div className="lg:col-span-2 space-y-4">
        {dayEvents.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <h3 className="font-semibold text-sm text-foreground">No events scheduled for this day</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Your agenda is completely open. You can schedule a meeting, client consultation, or task deadline.
            </p>
            <Button size="sm" onClick={onOpenCreateDialog} className="mt-4 text-xs">
              Schedule An Event
            </Button>
          </Card>
        ) : (
          dayEvents.map((evt) => (
            <Card
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="hover:border-primary/50 transition-all cursor-pointer shadow-xs group"
            >
              <CardContent className="p-4 space-y-3">
                {/* Event Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-muted/60 mt-0.5">{getEventIcon(evt.eventType)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {evt.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] uppercase font-mono px-1.5 py-0', getEventBadgeStyles(evt.eventType))}
                        >
                          {evt.eventType.replace('_', ' ')}
                        </Badge>
                      </div>
                      {evt.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{evt.description}</p>
                      )}
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {evt.status}
                  </Badge>
                </div>

                {/* Event Meta Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {evt.allDay
                        ? 'All-Day Event'
                        : `${new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>

                  {evt.location && (
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}

                  {evt.project && (
                    <div className="flex items-center space-x-1.5 truncate">
                      <FolderKanban className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">{evt.project.name}</span>
                    </div>
                  )}

                  {evt.organizer && (
                    <div className="flex items-center space-x-1.5 truncate">
                      <User className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{evt.organizer.fullName}</span>
                    </div>
                  )}
                </div>

                {/* Action Row */}
                {evt.meetingLink && (
                  <div className="pt-2 flex justify-end">
                    <a
                      href={evt.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                    >
                      <Video className="h-3.5 w-3.5 mr-1" />
                      <span>Join {evt.linkPlatform || 'Meeting'}</span>
                      <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Right Column: Daily Summary & Schedule Action */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Day Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Total Scheduled Items:</span>
              <span className="font-bold text-foreground">{dayEvents.length}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Meetings:</span>
              <span className="font-bold text-foreground">
                {dayEvents.filter((e) => e.eventType === 'MEETING' || e.eventType === 'CLIENT_MEETING').length}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Deadlines & Tasks:</span>
              <span className="font-bold text-foreground">
                {dayEvents.filter((e) => e.eventType === 'PROJECT_DEADLINE' || e.eventType === 'TASK' || e.eventType === 'MILESTONE').length}
              </span>
            </div>

            <Button size="sm" onClick={onOpenCreateDialog} className="w-full mt-2 text-xs">
              + Schedule On This Day
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
