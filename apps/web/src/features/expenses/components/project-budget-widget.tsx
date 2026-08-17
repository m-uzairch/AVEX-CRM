/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ProjectBudgetImpact } from '../types/expense-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ProjectBudgetWidgetProps {
  impact: ProjectBudgetImpact;
}

export function ProjectBudgetWidget({ impact }: ProjectBudgetWidgetProps) {
  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <span>Project Budget & Expense Monitoring</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {impact.projectCode}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Over-Budget Alert Banner */}
        {impact.isOverBudget && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>
              Warning: Project expenses (${impact.totalSpent.toFixed(2)}) exceed the allocated budget of ${impact.budget.toFixed(2)} by ${Math.abs(impact.remainingBudget).toFixed(2)}!
            </span>
          </div>
        )}

        {/* Budget Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-bold">
            <span className="text-muted-foreground">Budget Usage</span>
            <span
              className={`font-mono ${
                impact.isOverBudget ? 'text-rose-600 font-extrabold' : 'text-primary'
              }`}
            >
              {impact.percentageSpent}% Spent
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                impact.isOverBudget ? 'bg-rose-500' : impact.percentageSpent > 85 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, impact.percentageSpent)}%` }}
            />
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 p-2.5 rounded-lg border border-border/60">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase">Total Allocated Budget</div>
            <div className="text-sm font-extrabold text-foreground font-mono mt-0.5">
              ${impact.budget.toFixed(2)}
            </div>
          </div>

          <div className="bg-purple-500/5 p-2.5 rounded-lg border border-purple-500/20">
            <div className="text-[10px] text-purple-600 font-semibold uppercase flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Total Approved Spent
            </div>
            <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-0.5">
              ${impact.totalSpent.toFixed(2)}
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border ${
            impact.isOverBudget ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
          }`}>
            <div className={`text-[10px] font-semibold uppercase flex items-center gap-1 ${
              impact.isOverBudget ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              <Clock className="h-3 w-3" /> Remaining Budget
            </div>
            <div className={`text-sm font-extrabold font-mono mt-0.5 ${
              impact.isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              ${impact.remainingBudget.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
