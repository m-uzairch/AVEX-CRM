/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { InvoiceStatusAnalyticsItem } from '../types/financial-dashboard-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface InvoiceAnalyticsChartProps {
  data: InvoiceStatusAnalyticsItem[];
}

export function InvoiceAnalyticsChart({ data }: InvoiceAnalyticsChartProps) {
  const totalCount = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center space-x-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Invoice Status Distribution</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Active invoices breakdown by payment lifecycle status
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs">
        {totalCount === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No invoices generated yet.</div>
        ) : (
          data.map((item) => {
            const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({item.count})</span>
                  </div>
                  <div className="font-mono font-extrabold text-foreground">
                    ${item.totalAmount.toFixed(2)}
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
