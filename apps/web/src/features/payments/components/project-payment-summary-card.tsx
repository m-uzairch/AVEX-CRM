/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ProjectPaymentSummary } from '../types/payment-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, CheckCircle, Clock } from 'lucide-react';

interface ProjectPaymentSummaryCardProps {
  summary: ProjectPaymentSummary;
}

export function ProjectPaymentSummaryCard({ summary }: ProjectPaymentSummaryCardProps) {
  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <span>Project Financial Progress</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {summary.projectCode}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Financial Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-bold">
            <span className="text-muted-foreground">Payment Collection Status</span>
            <span className="font-mono text-emerald-600">{summary.percentagePaid}% Collected</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.percentagePaid)}%` }}
            />
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 p-2.5 rounded-lg border border-border/60">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase">Total Project Value</div>
            <div className="text-sm font-extrabold text-foreground font-mono mt-0.5">
              ${summary.totalProjectValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20">
            <div className="text-[10px] text-emerald-600 font-semibold uppercase flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Amount Received
            </div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              ${summary.amountReceived.toFixed(2)}
            </div>
          </div>

          <div className="bg-blue-500/5 p-2.5 rounded-lg border border-blue-500/20">
            <div className="text-[10px] text-blue-600 font-semibold uppercase flex items-center gap-1">
              <Clock className="h-3 w-3" /> Remaining Balance
            </div>
            <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
              ${summary.remainingBalance.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
