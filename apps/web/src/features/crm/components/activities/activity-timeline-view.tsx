/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import {
  PlusCircle,
  FileEdit,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  Archive,
  RotateCcw,
  Activity as ActivityIcon,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';
import { CRMActivityLog } from '../../types/activity-note-types';
import { Badge } from '@/components/ui/badge';

interface ActivityTimelineViewProps {
  activities: CRMActivityLog[];
  isLoading?: boolean;
}

export function ActivityTimelineView({
  activities,
  isLoading = false,
}: ActivityTimelineViewProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CUSTOMER_CREATED':
      case 'LEAD_CREATED':
        return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case 'LEAD_CONVERTED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-pulse" />;
      case 'NOTE_ADDED':
      case 'LEAD_NOTE_ADDED':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'FILE_UPLOADED':
        return <Paperclip className="h-4 w-4 text-purple-500" />;
      case 'CUSTOMER_UPDATED':
      case 'LEAD_UPDATED':
      case 'LEAD_STAGE_CHANGED':
        return <FileEdit className="h-4 w-4 text-amber-500" />;
      case 'LEAD_ASSIGNED':
      case 'EMPLOYEE_ASSIGNED':
        return <UserCheck className="h-4 w-4 text-indigo-500" />;
      case 'CUSTOMER_ARCHIVED':
      case 'LEAD_ARCHIVED':
        return <Archive className="h-4 w-4 text-muted-foreground" />;
      case 'CUSTOMER_RESTORED':
      case 'LEAD_RESTORED':
        return <RotateCcw className="h-4 w-4 text-teal-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-muted/40 h-20 rounded-xl border border-border" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-xl space-y-2 text-muted-foreground text-xs">
        <ActivityIcon className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
        <p className="font-semibold text-foreground">No activity records found</p>
        <p className="text-[11px]">Activities logged across customers, leads, and system actions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l border-border/80 space-y-6 my-4">
      {activities.map((act) => {
        const rawAudit = act.metadata?.audit;
        const audit = Array.isArray(rawAudit) ? rawAudit[0] : rawAudit;

        return (
          <div key={act.id} className="relative group text-xs">
            {/* Timeline node icon */}
            <div className="absolute -left-[31px] top-0.5 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center shadow-2xs group-hover:border-primary transition-colors">
              {getActionIcon(act.action)}
            </div>

            <div className="bg-card border border-border/70 p-4 rounded-xl space-y-2.5 hover:border-border transition-colors shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-bold text-foreground">{act.description}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono px-2 py-0.5">
                    {act.module}
                  </Badge>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-muted-foreground shrink-0 font-medium">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(act.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Audit Diff Container */}
              {audit && (
                <div className="p-2.5 rounded-lg bg-muted/60 border border-border/60 flex items-center space-x-2 text-[11px]">
                  <span className="font-medium text-muted-foreground">
                    {audit.label || audit.field || 'Audit Change'}:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive font-mono font-medium">
                    {String(audit.previousValue ?? 'None')}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    {String(audit.newValue ?? 'None')}
                  </span>
                </div>
              )}

              {/* User Metadata Footnote */}
              <div className="flex items-center space-x-4 pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                <span className="flex items-center font-medium text-foreground">
                  <User className="h-3 w-3 mr-1 text-primary" />
                  {act.user?.fullName || 'System User'}
                </span>
                {act.entityName && (
                  <span className="truncate">
                    Target: <span className="font-medium text-foreground">{act.entityName}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
