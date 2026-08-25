'use client';

import * as React from 'react';
import { CalendarEvent } from '../types/calendar-types';
import { cn } from '@/lib/utils';
import { Video, Flag, CheckSquare, PhoneCall, Users, Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  weekStartDay?: 'MONDAY' | 'SUNDAY';
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  weekStartDay = 'MONDAY',
  onSelectEvent,
  onSelectDate,
}: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days of week header
  const weekDays =
    weekStartDay === 'MONDAY'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Offset calculation
  let startOffset = firstDayOfMonth.getDay();
  if (weekStartDay === 'MONDAY') {
    startOffset = startOffset === 0 ? 6 : startOffset - 1;
  }

  // Generate 35-42 grid cells
  const daysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  const todayStr = new Date().toDateString();

  // Leading days from prev month
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    cells.push({
      date: d,
      isCurrentMonth: false,
      isToday: d.toDateString() === todayStr,
    });
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({
      date: d,
      isCurrentMonth: true,
      isToday: d.toDateString() === todayStr,
    });
  }

  // Trailing days of next month to fill grid rows to multiple of 7
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        date: d,
        isCurrentMonth: false,
        isToday: d.toDateString() === todayStr,
      });
    }
  }

  // Helper to get events occurring on a specific cell date
  const getEventsForDate = (date: Date) => {
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();

    return events.filter((e) => {
      const start = new Date(e.startTime);
      return (
        start.getFullYear() === dateYear &&
        start.getMonth() === dateMonth &&
        start.getDate() === dateDay
      );
    });
  };

  const getEventBadgeStyles = (eventType: string) => {
    switch (eventType) {
      case 'CLIENT_MEETING':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/25';
      case 'MEETING':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25';
      case 'PROJECT_DEADLINE':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/25';
      case 'MILESTONE':
        return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25';
      case 'TASK':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25';
      case 'FOLLOW_UP':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25';
      default:
        return 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/25';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CLIENT_MEETING':
        return <Video className="h-2.5 w-2.5 shrink-0" />;
      case 'MEETING':
        return <Users className="h-2.5 w-2.5 shrink-0" />;
      case 'PROJECT_DEADLINE':
      case 'MILESTONE':
        return <Flag className="h-2.5 w-2.5 shrink-0" />;
      case 'TASK':
        return <CheckSquare className="h-2.5 w-2.5 shrink-0" />;
      case 'FOLLOW_UP':
        return <PhoneCall className="h-2.5 w-2.5 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
      {/* Weekday Columns Header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-semibold py-2.5 text-muted-foreground">
        {weekDays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border">
        {cells.map((cell, idx) => {
          const dayEvents = getEventsForDate(cell.date);
          const maxVisible = 3;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const hiddenCount = dayEvents.length - maxVisible;

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(cell.date)}
              className={cn(
                'min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer group relative',
                cell.isCurrentMonth
                  ? 'bg-card hover:bg-muted/30'
                  : 'bg-muted/10 text-muted-foreground/50 hover:bg-muted/20'
              )}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center transition-colors',
                    cell.isToday
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-foreground'
                      : 'text-muted-foreground/60'
                  )}
                >
                  {cell.date.getDate()}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(cell.date);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity p-0.5"
                  title="Schedule on this date"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Event Pills */}
              <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                {visibleEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(evt);
                    }}
                    className={cn(
                      'w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium border truncate flex items-center space-x-1 transition-all',
                      getEventBadgeStyles(evt.eventType)
                    )}
                    title={`${evt.title} (${new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                  >
                    {getEventIcon(evt.eventType)}
                    <span className="truncate">{evt.title}</span>
                  </button>
                ))}

                {hiddenCount > 0 && (
                  <div className="text-[10px] font-bold text-primary hover:underline pt-0.5">
                    +{hiddenCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
