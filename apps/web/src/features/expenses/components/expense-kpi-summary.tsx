/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ExpenseKPISummary } from '../types/expense-types';
import { Receipt, Calendar, Clock, CheckCircle, FolderKanban } from 'lucide-react';

interface ExpenseKPISummaryCardsProps {
  summary: ExpenseKPISummary;
}

export function ExpenseKPISummaryCards({ summary }: ExpenseKPISummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Total Expenses */}
      <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Expenses</span>
          <Receipt className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-lg font-extrabold text-foreground font-mono">
          ${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-muted-foreground font-medium">All recorded claims</div>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>This Month</span>
          <Calendar className="h-4 w-4 text-indigo-500" />
        </div>
        <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
          ${summary.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-indigo-700/80 dark:text-indigo-300 font-medium">Current period spending</div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Pending Approvals</span>
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono">
          ${summary.pendingApprovalsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-amber-700/80 dark:text-amber-300 font-medium">
          {summary.pendingApprovalsCount} awaiting manager review
        </div>
      </div>

      {/* Approved Expenses */}
      <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Approved / Paid</span>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
          ${summary.approvedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300 font-medium">
          {summary.approvedCount} approved claims
        </div>
      </div>

      {/* Project Expenses */}
      <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Project Expenses</span>
          <FolderKanban className="h-4 w-4 text-purple-500" />
        </div>
        <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400 font-mono">
          ${summary.projectExpensesValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-purple-700/80 dark:text-purple-300 font-medium">Linked to project budgets</div>
      </div>
    </div>
  );
}
