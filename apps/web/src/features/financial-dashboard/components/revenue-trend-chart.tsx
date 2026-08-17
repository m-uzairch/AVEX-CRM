/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { MonthlyRevenueTrendItem } from '../types/financial-dashboard-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface RevenueTrendChartProps {
  data: MonthlyRevenueTrendItem[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.revenue, d.expenses]),
    1000
  );

  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>Monthly Revenue vs Expense Performance</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500 inline-block" /> Expenses
            </span>
          </div>
        </CardTitle>
        <CardDescription className="text-xs">
          Comparison of monthly collections and company operational expenses
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-border/80">
          {data.map((item, idx) => {
            const revHeightPct = Math.max(6, Math.round((item.revenue / maxVal) * 100));
            const expHeightPct = Math.max(6, Math.round((item.expenses / maxVal) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] p-1.5 rounded shadow-md border border-border pointer-events-none z-10 font-mono whitespace-nowrap">
                  <div>{item.month}</div>
                  <div className="text-emerald-600 font-bold">Rev: ${item.revenue.toFixed(2)}</div>
                  <div className="text-purple-600 font-bold">Exp: ${item.expenses.toFixed(2)}</div>
                </div>

                {/* Bars Container */}
                <div className="w-full flex items-end justify-center space-x-1.5 h-full">
                  <div
                    className="w-3.5 bg-emerald-500/90 rounded-t transition-all duration-500 hover:bg-emerald-600"
                    style={{ height: `${revHeightPct}%` }}
                  />
                  <div
                    className="w-3.5 bg-purple-500/90 rounded-t transition-all duration-500 hover:bg-purple-600"
                    style={{ height: `${expHeightPct}%` }}
                  />
                </div>

                <div className="text-[10px] text-muted-foreground font-mono mt-2 font-semibold truncate w-full text-center">
                  {item.month.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
