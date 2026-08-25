'use client';

import * as React from 'react';
import { CalendarEventType } from '../types/calendar-types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Video,
  Users,
  Flag,
  CheckSquare,
  PhoneCall,
  CalendarDays,
} from 'lucide-react';

interface CalendarFilterBarProps {
  selectedType: 'ALL' | CalendarEventType;
  onSelectType: (type: 'ALL' | CalendarEventType) => void;
  counts?: {
    all: number;
    clientMeetings: number;
    internalMeetings: number;
    projectDeadlines: number;
    taskDeadlines: number;
    followUps: number;
  };
}

export function CalendarFilterBar({
  selectedType,
  onSelectType,
  counts,
}: CalendarFilterBarProps) {
  const filters: {
    type: 'ALL' | CalendarEventType;
    label: string;
    icon: React.ReactNode;
    color: string;
    count?: number;
  }[] = [
    {
      type: 'ALL',
      label: 'All Schedules',
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      color: 'bg-primary/10 text-primary border-primary/20',
      count: counts?.all,
    },
    {
      type: 'CLIENT_MEETING',
      label: 'Client Portal Meetings',
      icon: <Video className="h-3.5 w-3.5 text-blue-500" />,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      count: counts?.clientMeetings,
    },
    {
      type: 'MEETING',
      label: 'Internal Meetings',
      icon: <Users className="h-3.5 w-3.5 text-emerald-500" />,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      count: counts?.internalMeetings,
    },
    {
      type: 'PROJECT_DEADLINE',
      label: 'Project Deadlines',
      icon: <Flag className="h-3.5 w-3.5 text-purple-500" />,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      count: counts?.projectDeadlines,
    },
    {
      type: 'TASK',
      label: 'Task Due Dates',
      icon: <CheckSquare className="h-3.5 w-3.5 text-amber-500" />,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      count: counts?.taskDeadlines,
    },
    {
      type: 'FOLLOW_UP',
      label: 'Follow-ups',
      icon: <PhoneCall className="h-3.5 w-3.5 text-rose-500" />,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      count: counts?.followUps,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((f) => {
        const isSelected = selectedType === f.type;
        return (
          <button
            key={f.type}
            type="button"
            onClick={() => onSelectType(f.type)}
            className={cn(
              'flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
            )}
          >
            <span className={cn('shrink-0', isSelected ? 'text-primary-foreground' : '')}>
              {f.icon}
            </span>
            <span>{f.label}</span>
            {f.count !== undefined && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-1 py-0 h-4 ml-1',
                  isSelected
                    ? 'border-primary-foreground/40 bg-primary-foreground/20 text-primary-foreground'
                    : 'border-border bg-muted/60 text-muted-foreground'
                )}
              >
                {f.count}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
