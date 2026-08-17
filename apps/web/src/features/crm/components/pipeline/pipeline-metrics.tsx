'use client';

import * as React from 'react';
import { StatsCard } from '../stats-card';
import { PipelineMetrics as PipelineMetricsType } from '../../types/pipeline-types';
import { Users, DollarSign, CheckCircle2, XCircle, Calculator, TrendingUp } from 'lucide-react';

interface PipelineMetricsProps {
  metrics: PipelineMetricsType;
}

export function PipelineMetrics({ metrics }: PipelineMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
      <StatsCard
        title="Total Leads"
        value={metrics.totalLeads.toLocaleString()}
        change="In pipeline"
        trend="up"
        icon={<Users className="h-4 w-4 text-blue-500" />}
      />
      <StatsCard
        title="Pipeline Value"
        value={`$${metrics.totalPipelineValue.toLocaleString()}`}
        change="Expected revenue"
        trend="up"
        icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
      />
      <StatsCard
        title="Won Deals"
        value={metrics.wonDealsCount.toLocaleString()}
        change="Successfully closed"
        trend="up"
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
      />
      <StatsCard
        title="Lost Deals"
        value={metrics.lostDealsCount.toLocaleString()}
        change="Closed lost"
        trend="down"
        icon={<XCircle className="h-4 w-4 text-red-500" />}
      />
      <StatsCard
        title="Avg Deal Size"
        value={`$${metrics.averageDealSize.toLocaleString()}`}
        change="Per opportunity"
        trend="up"
        icon={<Calculator className="h-4 w-4 text-purple-500" />}
      />
      <StatsCard
        title="Win Rate"
        value={`${metrics.conversionRate}%`}
        change="Pipeline win rate"
        trend="up"
        icon={<TrendingUp className="h-4 w-4 text-indigo-500" />}
      />
    </div>
  );
}
