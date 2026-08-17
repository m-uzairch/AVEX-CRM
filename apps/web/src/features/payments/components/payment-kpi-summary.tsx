/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { PaymentKPISummary } from '../types/payment-types';
import { DollarSign, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface PaymentKPISummaryCardsProps {
  summary: PaymentKPISummary;
}

export function PaymentKPISummaryCards({ summary }: PaymentKPISummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Collections */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Received Payments</span>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
          ${summary.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-muted-foreground font-medium">
          Across {summary.totalPaymentsCount} recorded payments
        </div>
      </div>

      {/* Outstanding Balance */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Outstanding Balance</span>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
          ${summary.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-muted-foreground font-medium">
          {summary.openInvoicesCount} open unpaid invoices
        </div>
      </div>

      {/* Overdue Amount */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Overdue Receivables</span>
          <AlertCircle className="h-4 w-4 text-rose-500" />
        </div>
        <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
          ${summary.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-rose-700/80 dark:text-rose-300 font-medium">
          {summary.overdueInvoicesCount} overdue invoices requiring follow-up
        </div>
      </div>

      {/* Open Invoices Count */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Active Pending Invoices</span>
          <FileText className="h-4 w-4 text-purple-500" />
        </div>
        <div className="text-xl font-extrabold text-foreground">
          {summary.openInvoicesCount} Invoices
        </div>
        <div className="text-[11px] text-purple-700/80 dark:text-purple-300 font-medium">
          Tracking due & overdue dates
        </div>
      </div>
    </div>
  );
}
