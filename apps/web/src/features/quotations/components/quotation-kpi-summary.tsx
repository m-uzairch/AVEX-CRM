/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { QuotationKPISummary } from '../types/quotation-types';
import { FileCheck, DollarSign, Clock, AlertTriangle } from 'lucide-react';

interface QuotationKPISummaryCardsProps {
  summary: QuotationKPISummary;
}

export function QuotationKPISummaryCards({ summary }: QuotationKPISummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Quoted Value */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Quoted Pipeline</span>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-xl font-extrabold text-foreground">
          ${summary.totalQuotedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-muted-foreground font-medium">
          Across {summary.totalQuotesCount} total estimates
        </div>
      </div>

      {/* Accepted Value */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Accepted & Won Value</span>
          <FileCheck className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
          ${summary.acceptedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300 font-medium">
          {summary.acceptedCount + summary.convertedCount} accepted / converted quotes
        </div>
      </div>

      {/* Pending Approval Value */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Pending Client Approval</span>
          <Clock className="h-4 w-4 text-purple-500" />
        </div>
        <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
          ${summary.pendingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-purple-700/80 dark:text-purple-300 font-medium">
          {summary.sentCount} quotes under review
        </div>
      </div>

      {/* Expired Quotes */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Expired Estimates</span>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
        <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
          {summary.expiredCount} Quotes
        </div>
        <div className="text-[11px] text-amber-700/80 dark:text-amber-300 font-medium">
          Passed valid expiry date
        </div>
      </div>
    </div>
  );
}
