'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UpcomingDeadline } from '../types/milestone-types';
import { Calendar, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  HIGH: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  CRITICAL: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

interface UpcomingDeadlinesWidgetProps {
  milestones: UpcomingDeadline[];
  projectId?: string;
}

export function UpcomingDeadlinesWidget({ milestones, projectId }: UpcomingDeadlinesWidgetProps) {
  const overdue = milestones.filter((m) => m.isOverdue);
  const upcoming = milestones.filter((m) => !m.isOverdue).slice(0, 5);

  return (
    <Card className="shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Upcoming Deadlines
          </div>
          {overdue.length > 0 && (
            <Badge variant="destructive" className="text-[10px] font-bold">
              {overdue.length} Overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-2">
        {/* Overdue milestones */}
        {overdue.map((m) => (
          <div
            key={m.id}
            className="flex items-start justify-between p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 group"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="text-xs font-bold text-foreground">{m.title}</span>
              </div>
              <span className="text-[10px] font-bold text-rose-500 pl-5">
                {Math.abs(m.daysRemaining)} days overdue
              </span>
            </div>
            <Badge variant="outline" className={`text-[9px] font-bold shrink-0 ${PRIORITY_COLORS[m.priority]}`}>
              {m.priority}
            </Badge>
          </div>
        ))}

        {/* Upcoming milestones */}
        {upcoming.map((m) => (
          <div
            key={m.id}
            className="flex items-start justify-between p-2.5 rounded-lg border border-border hover:border-primary/30 transition-colors group"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground">{m.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground pl-5">
                Due {new Date(m.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {m.daysRemaining !== null && m.daysRemaining >= 0 && (
                  <span className={`ml-1.5 font-semibold ${m.daysRemaining <= 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    ({m.daysRemaining}d left)
                  </span>
                )}
              </span>
            </div>
            <Badge variant="outline" className={`text-[9px] font-bold shrink-0 ${PRIORITY_COLORS[m.priority]}`}>
              {m.priority}
            </Badge>
          </div>
        ))}

        {milestones.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No upcoming milestone deadlines.
          </div>
        )}

        {projectId && milestones.length > 0 && (
          <Link
            href={`/projects/${projectId}?tab=milestones`}
            className="flex items-center justify-center gap-1.5 text-[11px] text-primary font-semibold hover:underline pt-1"
          >
            View all milestones <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
