/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { FinancialOverviewKPIs } from '../types/financial-dashboard-types';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Receipt } from 'lucide-react';

interface FinancialKPICardsProps {
  kpis: FinancialOverviewKPIs;
}

export function FinancialKPICards({ kpis }: FinancialKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Revenue Collected</span>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
          ${kpis.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-medium">This Month: ${kpis.revenueThisMonth.toFixed(2)}</span>
          <span
            className={`font-bold flex items-center gap-0.5 ${
              kpis.revenueGrowthMonthOverMonth >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {kpis.revenueGrowthMonthOverMonth >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {kpis.revenueGrowthMonthOverMonth}%
          </span>
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Net Profit</span>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </div>
        <div
          className={`text-xl font-extrabold font-mono ${
            kpis.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
          }`}
        >
          ${kpis.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <span>Profit Margin</span>
          <span className="font-mono font-bold text-foreground">{kpis.netProfitMargin}%</span>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Total Company Expenses</span>
          <Receipt className="h-4 w-4 text-purple-500" />
        </div>
        <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
          ${kpis.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-muted-foreground font-medium">
          This Month: ${kpis.expensesThisMonth.toFixed(2)}
        </div>
      </div>

      {/* Outstanding Receivables */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Outstanding Receivables</span>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </div>
        <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
          ${kpis.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-rose-600 dark:text-rose-400 font-bold">
            Overdue: ${kpis.overdueAmount.toFixed(2)}
          </span>
          <span className="text-muted-foreground font-medium">{kpis.activeInvoicesCount} Open</span>
        </div>
      </div>
    </div>
  );
}
