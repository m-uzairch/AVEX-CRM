'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientProjectOverview } from '../types/portal-types';
import {
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface ClientProjectProgressCardProps {
  project: ClientProjectOverview;
  onFilterSelect?: (filter: 'ALL' | 'ATTENTION' | 'IN_PROGRESS' | 'TODO' | 'COMPLETED') => void;
  selectedFilter?: string;
}

export function ClientProjectProgressCard({
  project,
  onFilterSelect,
  selectedFilter,
}: ClientProjectProgressCardProps) {
  const stats = project.taskStats || {
    completionPercentage: project.completionPercentage || 0,
    totalTasks: project.tasks?.length || 0,
    completedTasks: project.tasks?.filter((t) => t.status === 'COMPLETED').length || 0,
    remainingTasks: project.tasks?.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length || 0,
    inProgressTasks: project.tasks?.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length || 0,
    attentionRequiredTasks: project.tasks?.filter((t) => t.requiresClientAction || t.status === 'REVIEW').length || 0,
    currentStatus: project.status,
    currentPhase: project.currentPhase,
  };

  const completionPercentage = stats.completionPercentage;
  const totalTasks = stats.totalTasks;
  const completedTasks = stats.completedTasks;
  const remainingTasks = stats.remainingTasks;
  const inProgressTasks = stats.inProgressTasks;
  const attentionRequiredTasks = stats.attentionRequiredTasks;

  return (
    <Card className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base text-foreground tracking-tight">Project Progress</h3>
              <Badge variant="outline" className="text-xs font-mono font-bold">
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0
                ? `${completedTasks} of ${totalTasks} tasks completed`
                : `Phase milestone progression: ${project.currentPhase}`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="text-xs py-1 px-3 bg-primary/10 text-primary border-primary/20 font-bold"
            >
              <Layers className="h-3 w-3 mr-1" /> {project.currentPhase}
            </Badge>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar (████████████░░░░ 75%) */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden p-0.5 border border-border/80">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>0% Start</span>
            <span className="font-bold text-foreground">
              {completedTasks} / {totalTasks} Tasks Done ({completionPercentage}%)
            </span>
            <span>100% Completed</span>
          </div>
        </div>

        {/* Task Breakdown Clickable Pill Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Attention Required */}
          <button
            type="button"
            onClick={() => onFilterSelect && onFilterSelect('ATTENTION')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedFilter === 'ATTENTION'
                ? 'bg-rose-500/15 border-rose-500 ring-1 ring-rose-500/30'
                : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Action Needed
              </span>
              <span className="font-bold font-mono">{attentionRequiredTasks}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Requires your review</p>
          </button>

          {/* In Progress */}
          <button
            type="button"
            onClick={() => onFilterSelect && onFilterSelect('IN_PROGRESS')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedFilter === 'IN_PROGRESS'
                ? 'bg-sky-500/15 border-sky-500 ring-1 ring-sky-500/30'
                : 'bg-sky-500/5 border-sky-500/20 hover:bg-sky-500/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400">
              <span className="flex items-center gap-1">
                <PlayCircle className="h-3.5 w-3.5" /> In Progress
              </span>
              <span className="font-bold font-mono">{inProgressTasks}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Currently being worked on</p>
          </button>

          {/* Upcoming / Remaining */}
          <button
            type="button"
            onClick={() => onFilterSelect && onFilterSelect('TODO')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedFilter === 'TODO'
                ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/30'
                : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Upcoming
              </span>
              <span className="font-bold font-mono">{remainingTasks - inProgressTasks >= 0 ? remainingTasks - inProgressTasks : 0}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">What is coming next</p>
          </button>

          {/* Completed */}
          <button
            type="button"
            onClick={() => onFilterSelect && onFilterSelect('COMPLETED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedFilter === 'COMPLETED'
                ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/30'
                : 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
              </span>
              <span className="font-bold font-mono">{completedTasks}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Delivered & verified</p>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
