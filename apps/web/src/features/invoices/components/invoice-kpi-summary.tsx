/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { InvoiceKPISummary } from '../types/invoice-types';
import { DollarSign, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface InvoiceKPISummaryCardsProps {
  summary: InvoiceKPISummary;
}

export function InvoiceKPISummaryCards({ summary }: InvoiceKPISummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue Billed */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Billed Revenue</span>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-xl font-extrabold text-foreground">
          ${summary.totalBilledRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-muted-foreground font-medium">
          From {summary.totalInvoicesCount} total invoices
        </div>
      </div>

      {/* Total Paid Amount */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Paid Amount</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
          ${summary.totalPaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300 font-medium">
          {summary.paidCount} fully paid invoices
        </div>
      </div>

      {/* Outstanding Balance */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Outstanding Balance</span>
          <FileText className="h-4 w-4 text-amber-500" />
        </div>
        <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
          ${summary.totalOutstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-amber-700/80 dark:text-amber-300 font-medium">
          {summary.sentCount} sent / pending invoices
        </div>
      </div>

      {/* Overdue Amount */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Overdue Balance</span>
          <AlertCircle className="h-4 w-4 text-rose-500" />
        </div>
        <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
          ${summary.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-rose-700/80 dark:text-rose-300 font-medium">
          {summary.overdueCount} overdue invoices
        </div>
      </div>
    </div>
  );
}
