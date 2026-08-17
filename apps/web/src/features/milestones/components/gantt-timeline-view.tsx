'use client';

import * as React from 'react';
import { GanttBar, TimelineZoom } from '../types/milestone-types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-slate-400',
  PLANNING: 'bg-blue-400',
  IN_PROGRESS: 'bg-indigo-500',
  UNDER_REVIEW: 'bg-amber-400',
  COMPLETED: 'bg-emerald-500',
  DELAYED: 'bg-rose-500',
  CANCELLED: 'bg-gray-400',
};

const PRIORITY_BORDER: Record<string, string> = {
  LOW: 'border-slate-400',
  MEDIUM: 'border-blue-400',
  HIGH: 'border-amber-400',
  CRITICAL: 'border-rose-500',
};

interface GanttTimelineViewProps {
  bars: GanttBar[];
  zoom: TimelineZoom;
  onZoomChange: (z: TimelineZoom) => void;
}

function getDaysBetween(a: Date, b: Date) {
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

export function GanttTimelineView({ bars, zoom, onZoomChange }: GanttTimelineViewProps) {
  const today = React.useMemo(() => new Date(), []);

  // Compute window range based on zoom
  const windowDays = zoom === 'week' ? 14 : zoom === 'month' ? 60 : 120;
  const [windowStart, setWindowStart] = React.useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(windowDays / 4));
    return d;
  });
  const windowEnd = React.useMemo(() => {
    const d = new Date(windowStart);
    d.setDate(d.getDate() + windowDays);
    return d;
  }, [windowStart, windowDays]);

  const totalDays = getDaysBetween(windowStart, windowEnd);

  const shiftWindow = (direction: 'prev' | 'next') => {
    setWindowStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (direction === 'next' ? Math.floor(windowDays / 2) : -Math.floor(windowDays / 2)));
      return d;
    });
  };

  // Generate column headers
  const headers: { label: string; x: number; width: number }[] = React.useMemo(() => {
    const cols: { label: string; x: number; width: number }[] = [];
    const d = new Date(windowStart);
    let i = 0;

    if (zoom === 'week') {
      // Day-by-day columns
      while (d < windowEnd) {
        cols.push({
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          x: (i / totalDays) * 100,
          width: (1 / totalDays) * 100,
        });
        d.setDate(d.getDate() + 1);
        i++;
      }
    } else {
      // Week columns
      while (d < windowEnd) {
        const weekLabel = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        const daysInCol = Math.min(7, getDaysBetween(d, windowEnd));
        cols.push({ label: weekLabel, x: (i / totalDays) * 100, width: (daysInCol / totalDays) * 100 });
        d.setDate(d.getDate() + 7);
        i += 7;
      }
    }
    return cols;
  }, [windowStart, windowEnd, totalDays, zoom]);

  // Compute today's position %
  const todayX = React.useMemo(() => {
    if (today < windowStart || today > windowEnd) return null;
    return (getDaysBetween(windowStart, today) / totalDays) * 100;
  }, [today, windowStart, windowEnd, totalDays]);

  const getBarLayout = (bar: GanttBar) => {
    const start = new Date(bar.startDate);
    const end = new Date(bar.dueDate);
    const clampedStart = start < windowStart ? windowStart : start;
    const clampedEnd = end > windowEnd ? windowEnd : end;
    if (clampedStart >= clampedEnd) return null;

    const left = (getDaysBetween(windowStart, clampedStart) / totalDays) * 100;
    const width = (getDaysBetween(clampedStart, clampedEnd) / totalDays) * 100;
    return { left, width };
  };

  if (bars.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
        No milestones with start and due dates to display. Add dates to milestones to see them on the timeline.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => shiftWindow('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => shiftWindow('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono text-muted-foreground">
            {windowStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
            {windowEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center rounded-lg border border-border p-0.5 bg-card text-xs font-semibold">
          {(['week', 'month', 'quarter'] as TimelineZoom[]).map((z) => (
            <button
              key={z}
              onClick={() => onZoomChange(z)}
              className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                zoom === z ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="relative overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        {/* Column Headers */}
        <div className="relative border-b border-border bg-muted/40 h-8">
          {headers.map((h, idx) => (
            <div
              key={idx}
              className="absolute top-0 h-full flex items-center px-1 text-[10px] font-medium text-muted-foreground border-r border-border/50"
              style={{ left: `calc(${h.x}% + 140px)`, width: `calc(${h.width}%)` }}
            >
              {h.label}
            </div>
          ))}
          <div className="absolute left-0 w-[140px] h-full flex items-center px-3 text-[10px] font-bold uppercase text-muted-foreground border-r border-border">
            Milestone
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {bars.map((bar) => {
            const layout = getBarLayout(bar);
            return (
              <div key={bar.id} className="relative flex items-center min-h-[44px] hover:bg-muted/20 transition-colors">
                {/* Label Column */}
                <div className="absolute left-0 w-[140px] px-3 flex flex-col justify-center border-r border-border shrink-0 h-full z-10 bg-card">
                  <span className="text-[11px] font-bold text-foreground truncate">{bar.title}</span>
                  <span className={`text-[9px] font-bold uppercase ${bar.isOverdue ? 'text-rose-500' : 'text-muted-foreground'}`}>
                    {bar.isOverdue ? 'OVERDUE' : bar.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Timeline Area */}
                <div className="relative ml-[140px] flex-1 h-full min-h-[44px]">
                  {/* Today marker */}
                  {todayX !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-500/70 z-20"
                      style={{ left: `${todayX}%` }}
                    />
                  )}

                  {/* Gantt Bar */}
                  {layout && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-full border-l-4 ${PRIORITY_BORDER[bar.priority]} ${STATUS_COLORS[bar.status]} opacity-90 group cursor-default`}
                      style={{ left: `${layout.left}%`, width: `${Math.max(layout.width, 1)}%` }}
                      title={`${bar.title} (${bar.progressPercentage}%)`}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute inset-0 rounded-full bg-white/30"
                        style={{ width: `${bar.progressPercentage}%` }}
                      />
                      {/* Label if bar is wide enough */}
                      {layout.width > 8 && (
                        <span className="absolute inset-0 flex items-center px-2 text-[9px] font-bold text-white truncate">
                          {bar.progressPercentage}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-muted-foreground pt-1">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center space-x-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
          </div>
        ))}
        <div className="flex items-center space-x-1.5">
          <div className="h-3 w-0.5 bg-rose-500" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
