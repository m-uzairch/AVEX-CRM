/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ProjectReportSummary } from '../../types/project-report-types';
import { Card, CardContent } from '@/components/ui/card';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface ReportsKPISummaryProps {
  summary: ProjectReportSummary | null;
  isLoading?: boolean;
}

export function ReportsKPISummary({ summary, isLoading }: ReportsKPISummaryProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse bg-muted/40 h-24 border-border/60" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Projects',
      value: summary.totalProjects,
      subtitle: `${summary.activeProjects} active`,
      icon: <FolderKanban className="h-4 w-4 text-blue-500" />,
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Projects',
      value: summary.activeProjects,
      subtitle: 'In execution',
      icon: <TrendingUp className="h-4 w-4 text-indigo-500" />,
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Completed',
      value: summary.completedProjects,
      subtitle: 'Delivered',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Delayed Projects',
      value: summary.delayedProjects,
      subtitle: summary.delayedProjects > 0 ? 'Requires Action' : 'On Schedule',
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      bgColor: summary.delayedProjects > 0 ? 'bg-amber-500/10' : 'bg-muted/40',
      highlight: summary.delayedProjects > 0,
    },
    {
      title: 'Total Tasks',
      value: summary.totalTasks,
      subtitle: `${summary.completedTasks} completed`,
      icon: <ListTodo className="h-4 w-4 text-cyan-500" />,
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Completed Tasks',
      value: summary.completedTasks,
      subtitle: `${summary.totalTasks > 0 ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0}% completion`,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Team',
      value: summary.activeEmployees,
      subtitle: 'Allocated staff',
      icon: <Users className="h-4 w-4 text-purple-500" />,
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Hours Logged',
      value: `${summary.totalHoursLogged}h`,
      subtitle: `$${summary.totalBudgetUsed.toLocaleString()} budget`,
      icon: <Clock className="h-4 w-4 text-orange-500" />,
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className={`shadow-2xs border-border/80 transition-all hover:border-primary/40 ${
            kpi.highlight ? 'border-amber-500/40 bg-amber-500/5' : ''
          }`}
        >
          <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground truncate">{kpi.title}</span>
              <div className={`p-1.5 rounded-md ${kpi.bgColor} shrink-0`}>{kpi.icon}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground tracking-tight">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground truncate">{kpi.subtitle}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
