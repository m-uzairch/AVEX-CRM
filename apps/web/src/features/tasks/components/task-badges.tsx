import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskStatus, TaskPriority } from '../types/task-types';
import {
  Circle,
  PlayCircle,
  FileCheck,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
} from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case 'TODO':
      return (
        <Badge variant="outline" className={`bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 gap-1 font-medium ${className || ''}`}>
          <Circle className="h-3 w-3" /> Todo
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="outline" className={`bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 gap-1 font-medium ${className || ''}`}>
          <PlayCircle className="h-3 w-3 animate-pulse" /> In Progress
        </Badge>
      );
    case 'REVIEW':
      return (
        <Badge variant="outline" className={`bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 gap-1 font-medium ${className || ''}`}>
          <FileCheck className="h-3 w-3" /> Review
        </Badge>
      );
    case 'BLOCKED':
      return (
        <Badge variant="outline" className={`bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1 font-bold ${className || ''}`}>
          <AlertOctagon className="h-3 w-3" /> Blocked
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="outline" className={`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 font-medium ${className || ''}`}>
          <CheckCircle2 className="h-3 w-3" /> Completed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="outline" className={`bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 gap-1 font-medium ${className || ''}`}>
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function TaskPriorityBadge({ priority, className }: PriorityBadgeProps) {
  switch (priority) {
    case 'URGENT':
      return (
        <Badge variant="outline" className={`bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1 font-semibold ${className || ''}`}>
          <Flame className="h-3 w-3 text-rose-500 fill-rose-500" /> Urgent
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="outline" className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 font-medium ${className || ''}`}>
          <ArrowUp className="h-3 w-3" /> High
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="outline" className={`bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 gap-1 font-medium ${className || ''}`}>
          <Minus className="h-3 w-3" /> Medium
        </Badge>
      );
    case 'LOW':
      return (
        <Badge variant="outline" className={`bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 gap-1 font-medium ${className || ''}`}>
          <ArrowDown className="h-3 w-3" /> Low
        </Badge>
      );
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
}
