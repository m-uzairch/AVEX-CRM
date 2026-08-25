'use client';

import * as React from 'react';
import { InsightsSummaryKPIs } from '../schemas/smart-insights-schemas';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

interface SmartInsightsKpiBarProps {
  summary: InsightsSummaryKPIs;
}

export function SmartInsightsKpiBar({ summary }: SmartInsightsKpiBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {/* Critical Alerts */}
      <Card className="border-rose-500/20 bg-rose-500/5 shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Critical Urgency
            </span>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{summary.criticalCount}</p>
            <span className="text-[10px] text-muted-foreground">Immediate action needed</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* High Priority Alerts */}
      <Card className="border-amber-500/20 bg-amber-500/5 shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              High Priority
            </span>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{summary.highCount}</p>
            <span className="text-[10px] text-muted-foreground">Attention recommended</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Cash at Risk */}
      <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Cash at Risk
            </span>
            <p className="text-xl font-extrabold text-foreground mt-0.5">
              ${summary.totalCashAtRisk.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Overdue invoice balances</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Opportunity Value */}
      <Card className="border-primary/20 bg-primary/5 shadow-2xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Stalled Pipeline Value
            </span>
            <p className="text-xl font-extrabold text-foreground mt-0.5">
              ${summary.pipelineOpportunityValue.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">In inactive sales deals</span>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
