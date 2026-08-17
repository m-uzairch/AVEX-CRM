/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Download, SlidersHorizontal } from 'lucide-react';
import { FinancialDateRange } from '../types/financial-dashboard-types';

interface FinancialFilterBarProps {
  dateRange: FinancialDateRange;
  onDateRangeChange: (range: FinancialDateRange) => void;
  onOpenSettings: () => void;
  onExport: (format: 'csv' | 'json') => void;
}

export function FinancialFilterBar({
  dateRange,
  onDateRangeChange,
  onOpenSettings,
  onExport,
}: FinancialFilterBarProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Date Range Selector Pills */}
      <div className="flex items-center space-x-1.5">
        {[
          { id: 'THIS_MONTH', label: 'This Month' },
          { id: 'THIS_QUARTER', label: 'This Quarter' },
          { id: 'THIS_YEAR', label: 'This Year' },
          { id: 'ALL_TIME', label: 'All Time' },
        ].map((item) => (
          <Button
            key={item.id}
            variant={dateRange === item.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onDateRangeChange(item.id as FinancialDateRange)}
            className={`h-8 text-xs font-semibold px-3 ${
              dateRange === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSettings}
          className="h-8.5 px-3 text-xs gap-1.5 font-semibold text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Customize Layout</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('csv')}
          className="h-8.5 px-3 text-xs gap-1.5 font-semibold text-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Summary (CSV)</span>
        </Button>
      </div>
    </div>
  );
}
