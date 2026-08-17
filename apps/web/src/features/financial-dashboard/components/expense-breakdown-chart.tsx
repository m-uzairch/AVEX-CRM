/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ExpenseCategoryBreakdownItem } from '../types/financial-dashboard-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

interface ExpenseBreakdownChartProps {
  data: ExpenseCategoryBreakdownItem[];
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center space-x-2">
          <PieChart className="h-4 w-4 text-purple-500" />
          <span>Expenses by Category</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Breakdown of operational and project expenditure areas
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs">
        {data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No approved expenses recorded yet.</div>
        ) : (
          data.map((cat) => (
            <div key={cat.categoryId} className="space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-foreground">{cat.categoryName}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-muted-foreground text-[11px]">{cat.percentage}%</span>
                  <span className="font-extrabold text-foreground">${cat.amount.toFixed(2)}</span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
