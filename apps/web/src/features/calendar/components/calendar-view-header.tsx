'use client';

import * as React from 'react';
import { CalendarViewMode } from '../types/calendar-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Calendar,
  Layers,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarViewHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenCreateDialog: () => void;
}

export function CalendarViewHeader({
  currentDate,
  viewMode,
  searchQuery,
  onSearchChange,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onOpenCreateDialog,
}: CalendarViewHeaderProps) {
  // Format header title based on view mode
  const getHeaderTitle = () => {
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    if (viewMode === 'MONTH') {
      return `${monthName} ${year}`;
    }

    if (viewMode === 'DAY') {
      return currentDate.toLocaleDateString('default', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    // Week view: calculate start and end of week
    const currentDay = currentDate.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startMonth = monday.toLocaleString('default', { month: 'short' });
    const endMonth = sunday.toLocaleString('default', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startMonth} ${monday.getDate()} – ${sunday.getDate()}, ${year}`;
    }
    return `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}, ${year}`;
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2">
      {/* Date Navigation */}
      <div className="flex items-center space-x-2 w-full md:w-auto">
        <div className="flex items-center border border-border rounded-lg bg-card p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onPrev}
            className="h-7 w-7 p-0"
            title="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="h-7 px-2.5 text-xs font-semibold"
          >
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onNext}
            className="h-7 w-7 p-0"
            title="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Right Controls: Search, View Mode, New Event */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs w-full"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center border border-border rounded-lg bg-card p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('MONTH')}
            className={cn(
              'flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              viewMode === 'MONTH'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Month</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('WEEK')}
            className={cn(
              'flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              viewMode === 'WEEK'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Layers className="h-3 w-3" />
            <span className="hidden sm:inline">Week</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('DAY')}
            className={cn(
              'flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              viewMode === 'DAY'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Day</span>
          </button>
        </div>

        {/* New Event Button */}
        <Button size="sm" onClick={onOpenCreateDialog} className="h-8 text-xs shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span>Schedule Event</span>
        </Button>
      </div>
    </div>
  );
}
