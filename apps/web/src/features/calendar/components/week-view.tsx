'use client';

import * as React from 'react';
import { CalendarEvent } from '../types/calendar-types';
import { cn } from '@/lib/utils';
import { Video, Users, Flag, CheckSquare, PhoneCall, ExternalLink } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  weekStartDay?: 'MONDAY' | 'SUNDAY';
  workingHoursStart?: string; // e.g. "09:00"
  workingHoursEnd?: string;   // e.g. "18:00"
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTimeSlot: (date: Date, hour: number) => void;
}

export function WeekView({
  currentDate,
  events,
  weekStartDay = 'MONDAY',
  onSelectEvent,
  onSelectTimeSlot,
}: WeekViewProps) {
  // Generate 7 days of the week for currentDate
  const currentDay = currentDate.getDay();
  let diffToStart = currentDay;
  if (weekStartDay === 'MONDAY') {
    diffToStart = currentDay === 0 ? -6 : 1 - currentDay;
  } else {
    diffToStart = -currentDay;
  }

  const weekStartDate = new Date(currentDate);
  weekStartDate.setDate(currentDate.getDate() + diffToStart);

  const days: { date: Date; isToday: boolean }[] = [];
  const todayStr = new Date().toDateString();

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + i);
    days.push({
      date: d,
      isToday: d.toDateString() === todayStr,
    });
  }

  // Hours: 08:00 to 20:00
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    return events.filter((e) => {
      if (e.allDay) return false;
      const start = new Date(e.startTime);
      return (
        start.getFullYear() === year &&
        start.getMonth() === month &&
        start.getDate() === day &&
        start.getHours() === hour
      );
    });
  };

  const getAllDayEventsForDay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    return events.filter((e) => {
      if (!e.allDay) return false;
      const start = new Date(e.startTime);
      return (
        start.getFullYear() === year &&
        start.getMonth() === month &&
        start.getDate() === day
      );
    });
  };

  const getEventBadgeStyles = (eventType: string) => {
    switch (eventType) {
      case 'CLIENT_MEETING':
        return 'bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-500/40 hover:bg-blue-500/30';
      case 'MEETING':
        return 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/30';
      case 'PROJECT_DEADLINE':
        return 'bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-500/40 hover:bg-purple-500/30';
      case 'MILESTONE':
        return 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border-indigo-500/40 hover:bg-indigo-500/30';
      case 'TASK':
        return 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 hover:bg-amber-500/30';
      case 'FOLLOW_UP':
        return 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-500/40 hover:bg-rose-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/40 hover:bg-primary/30';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CLIENT_MEETING':
        return <Video className="h-3 w-3 shrink-0" />;
      case 'MEETING':
        return <Users className="h-3 w-3 shrink-0" />;
      case 'PROJECT_DEADLINE':
      case 'MILESTONE':
        return <Flag className="h-3 w-3 shrink-0" />;
      case 'TASK':
        return <CheckSquare className="h-3 w-3 shrink-0" />;
      case 'FOLLOW_UP':
        return <PhoneCall className="h-3 w-3 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs flex flex-col">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-border bg-muted/40 text-center py-2.5">
        <div className="text-xs font-semibold text-muted-foreground self-center">Time</div>
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              {d.date.toLocaleDateString([], { weekday: 'short' })}
            </span>
            <span
              className={cn(
                'text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center mt-0.5',
                d.isToday ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground'
              )}
            >
              {d.date.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* All-Day Events Strip */}
      <div className="grid grid-cols-8 border-b border-border bg-muted/15 min-h-[36px]">
        <div className="text-[10px] font-semibold text-muted-foreground flex items-center justify-center p-1 border-r border-border">
          All-Day
        </div>
        {days.map((d, i) => {
          const allDayEvents = getAllDayEventsForDay(d.date);
          return (
            <div key={i} className="p-1 border-r border-border space-y-1">
              {allDayEvents.map((evt) => (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => onSelectEvent(evt)}
                  className={cn(
                    'w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate flex items-center space-x-1',
                    getEventBadgeStyles(evt.eventType)
                  )}
                  title={evt.title}
                >
                  {getEventIcon(evt.eventType)}
                  <span className="truncate">{evt.title}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Hourly Timeline Grid */}
      <div className="divide-y divide-border overflow-y-auto max-h-[600px]">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 min-h-[56px] group">
            {/* Hour Label */}
            <div className="text-[11px] font-medium text-muted-foreground text-center pt-2 border-r border-border bg-muted/5 select-none">
              {hour.toString().padStart(2, '0')}:00
            </div>

            {/* 7 Days Slots */}
            {days.map((d, dayIndex) => {
              const slotEvents = getEventsForDayAndHour(d.date, hour);

              return (
                <div
                  key={dayIndex}
                  onClick={() => onSelectTimeSlot(d.date, hour)}
                  className="border-r border-border p-1 hover:bg-accent/40 cursor-pointer transition-colors relative space-y-1"
                >
                  {slotEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className={cn(
                        'p-1.5 rounded-md border text-xs font-medium cursor-pointer transition-all shadow-xs space-y-0.5',
                        getEventBadgeStyles(evt.eventType)
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 font-bold text-[11px] truncate">
                          {getEventIcon(evt.eventType)}
                          <span className="truncate">{evt.title}</span>
                        </div>
                        {evt.meetingLink && (
                          <a
                            href={evt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:text-primary/80"
                            title="Join Meeting"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] opacity-85 truncate">
                        {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                        {new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
