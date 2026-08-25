'use client';

import * as React from 'react';
import { AttendanceRecord, ShiftConfig } from '../types/attendance-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
} from 'lucide-react';

interface ClockCardProps {
  todayRecord: AttendanceRecord | null;
  shiftConfig: ShiftConfig;
  isClockedIn: boolean;
  isClockedOut: boolean;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
}

export function ClockCard({
  todayRecord,
  shiftConfig,
  isClockedIn,
  isClockedOut,
  onClockIn,
  onClockOut,
}: ClockCardProps) {
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Live real-time clock ticker
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live active duration counter
  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isClockedIn && todayRecord?.clockIn) {
      const startMs = new Date(todayRecord.clockIn).getTime();
      const updateElapsed = () => {
        const diffSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setElapsedSeconds(diffSec);
      };
      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else if (todayRecord?.clockIn && todayRecord?.clockOut) {
      setElapsedSeconds(todayRecord.workingMinutes * 60);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn, todayRecord]);

  const formatElapsed = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockInAction = async () => {
    setIsSubmitting(true);
    try {
      await onClockIn();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOutAction = async () => {
    setIsSubmitting(true);
    try {
      await onClockOut();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden shadow-xs">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Col 1: Real-time Live Clock & Date */}
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>
                {currentTime.toLocaleDateString([], {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              Shift: {shiftConfig.shiftStart} AM – {shiftConfig.shiftEnd} PM ({shiftConfig.gracePeriodMinutes}m grace)
            </p>
          </div>

          {/* Col 2: Active Working Status & Ticker */}
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-border/70 bg-background/50 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Today&apos;s Working Time
            </span>

            <div className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-tight">
              {formatElapsed(elapsedSeconds)}
            </div>

            <div className="flex items-center gap-1.5">
              {isClockedIn ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Clocked In (Active)
                </Badge>
              ) : isClockedOut ? (
                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs px-2.5 py-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Completed For Today
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs px-2.5 py-0.5 text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  Not Clocked In
                </Badge>
              )}

              {todayRecord?.status === 'LATE' && (
                <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                  LATE
                </Badge>
              )}
            </div>
          </div>

          {/* Col 3: Actions & Details */}
          <div className="space-y-3 flex flex-col justify-center">
            {!isClockedIn && !isClockedOut && (
              <Button
                type="button"
                size="lg"
                onClick={handleClockInAction}
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md h-12 text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                <span>Clock In Now</span>
              </Button>
            )}

            {isClockedIn && (
              <Button
                type="button"
                size="lg"
                variant="destructive"
                onClick={handleClockOutAction}
                disabled={isSubmitting}
                className="w-full font-bold shadow-md h-12 text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                <span>Clock Out & End Day</span>
              </Button>
            )}

            {isClockedOut && (
              <div className="p-3 rounded-lg border border-border bg-muted/20 text-center space-y-0.5">
                <p className="text-xs font-bold text-foreground">Day Completed</p>
                <p className="text-[11px] text-muted-foreground">
                  Clock in: {new Date(todayRecord?.clockIn || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Out: {new Date(todayRecord?.clockOut || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span>Standard: {shiftConfig.standardWorkingHours}h/day</span>
              <span className="flex items-center text-primary">
                <Clock className="h-3 w-3 mr-1" />
                Auto-Synced
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
