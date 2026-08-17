'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitPullRequest, Sparkles } from 'lucide-react';
import { PipelineStageMetrics } from '../../types/dashboard-types';

interface PipelineForecastWidgetProps {
  stages: PipelineStageMetrics[];
  totalPipelineValue: number;
  revenueForecast: number;
  avgDealSize: number;
  winRate: number;
  isLoading?: boolean;
}

export function PipelineForecastWidget({
  stages,
  totalPipelineValue,
  revenueForecast,
  avgDealSize,
  winRate,
  isLoading = false,
}: PipelineForecastWidgetProps) {
  if (isLoading) {
    return (
      <Card className="shadow-2xs border-border">
        <CardContent className="p-6">
          <div className="animate-pulse bg-muted/40 h-56 rounded-xl border border-border" />
        </CardContent>
      </Card>
    );
  }

  const totalDeals = stages.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="shadow-2xs border-border text-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
        <div>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <GitPullRequest className="h-4 w-4 text-purple-500" />
            <span>Sales Pipeline Stage Breakdown & Revenue Forecast</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Opportunity velocity, stage deal counts, and weighted revenue projections.
          </CardDescription>
        </div>

        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs gap-1.5 font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Forecast: ${revenueForecast.toLocaleString()}</span>
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6 pt-3">
        {/* Metric Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/40 p-3.5 rounded-xl border border-border/60">
          <div>
            <span className="text-[10px] uppercase font-medium text-muted-foreground block">Active Opportunities</span>
            <span className="text-base font-extrabold text-foreground font-mono">{totalDeals} Deals</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-medium text-muted-foreground block">Raw Pipeline Value</span>
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              ${totalPipelineValue.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-medium text-muted-foreground block">Average Deal Size</span>
            <span className="text-base font-extrabold text-foreground font-mono">
              ${avgDealSize.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-medium text-muted-foreground block">Win Conversion Rate</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {winRate}%
            </span>
          </div>
        </div>

        {/* Stage Funnel Visual Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
            Stage-by-Stage Weighted Funnel
          </h4>

          <div className="space-y-2.5">
            {stages.map((stg) => (
              <div key={stg.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stg.color }}
                    />
                    <span className="font-bold text-foreground">{stg.label}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      {stg.count} deals
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-muted-foreground text-[11px]">
                      Prob: <strong className="text-foreground">{stg.winProbability}%</strong>
                    </span>
                    <span className="font-bold text-foreground">
                      ${stg.value.toLocaleString()}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      (W: ${stg.weightedValue.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Funnel Progress Bar */}
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(stg.winProbability, 100)}%`,
                      backgroundColor: stg.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
