/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ProjectPerformanceMetric, ProjectHealthStatus } from '../../types/project-report-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, AlertTriangle, ShieldCheck, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ProjectPerformanceTableProps {
  metrics: ProjectPerformanceMetric[];
  isLoading?: boolean;
}

export function ProjectPerformanceTable({ metrics, isLoading }: ProjectPerformanceTableProps) {
  if (isLoading) {
    return <Card className="h-64 animate-pulse bg-muted/30" />;
  }

  const renderHealthBadge = (status: ProjectHealthStatus, score: number) => {
    if (status === 'HEALTHY') {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1 font-semibold">
          <ShieldCheck className="h-3 w-3" />
          <span>Healthy ({score})</span>
        </Badge>
      );
    }
    if (status === 'WARNING') {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] gap-1 font-semibold">
          <AlertTriangle className="h-3 w-3" />
          <span>Warning ({score})</span>
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] gap-1 font-semibold">
        <ShieldAlert className="h-3 w-3" />
        <span>Critical ({score})</span>
      </Badge>
    );
  };

  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <span>Project Performance & Health Matrix</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time milestone progress, task completion percentages, delay warnings, and composite project health.
          </CardDescription>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          {metrics.length} Total Projects Listed
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-4">Code & Project</th>
              <th className="py-2.5 px-3">Manager</th>
              <th className="py-2.5 px-3">Overall Progress</th>
              <th className="py-2.5 px-3">Milestones</th>
              <th className="py-2.5 px-3">Tasks</th>
              <th className="py-2.5 px-3">Schedule Status</th>
              <th className="py-2.5 px-3">Budget Utilization</th>
              <th className="py-2.5 px-4 text-right">Project Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {metrics.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                  No project metrics found matching current filters.
                </td>
              </tr>
            ) : (
              metrics.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/projects/${p.id}`} className="group">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-xs">
                          {p.projectCode}
                        </span>
                        <span className="truncate max-w-[180px]">{p.name}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{p.customerName}</div>
                    </Link>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-foreground">{p.projectManagerName}</span>
                  </td>

                  {/* Completion % bar */}
                  <td className="py-3 px-3 min-w-[130px]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-foreground">{p.completionPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          p.completionPercentage >= 80
                            ? 'bg-emerald-500'
                            : p.completionPercentage >= 40
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${p.completionPercentage}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground">
                      {p.completedMilestones} / {p.totalMilestones}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {p.milestoneProgressPercentage}% Done
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground">
                      {p.completedTasks} / {p.totalTasks}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{p.taskCompletionPercentage}% Done</div>
                  </td>

                  <td className="py-3 px-3">
                    {p.isDelayed ? (
                      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Behind ({p.delayDays}d)</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>On Schedule</span>
                      </Badge>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground">
                      ${p.budgetUsed.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      of ${p.budget.toLocaleString()}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {renderHealthBadge(p.healthStatus, p.healthScore)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
