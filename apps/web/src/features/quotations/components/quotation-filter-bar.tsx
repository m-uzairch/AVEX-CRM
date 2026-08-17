/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';
import { QuotationFilterState } from '../types/quotation-types';

interface QuotationFilterBarProps {
  filters: QuotationFilterState;
  onFilterChange: (newFilters: QuotationFilterState) => void;
  onReset: () => void;
}

export function QuotationFilterBar({ filters, onFilterChange, onReset }: QuotationFilterBarProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search quote #, customer, lead title..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9 h-8.5 text-xs bg-background"
          />
        </div>

        {/* Status Select */}
        <select
          value={filters.status || 'ALL'}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="flex h-8.5 w-36 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="VIEWED">Viewed</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
          <option value="CONVERTED">Converted</option>
        </select>

        {/* Estimate Type Select */}
        <select
          value={filters.estimateType || 'ALL'}
          onChange={(e) => onFilterChange({ ...filters, estimateType: e.target.value })}
          className="flex h-8.5 w-36 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="ALL">All Types</option>
          <option value="FIXED_PRICE">Fixed Price</option>
          <option value="HOURLY">Hourly Rate</option>
          <option value="MONTHLY">Monthly Retainer</option>
          <option value="CUSTOM">Custom</option>
        </select>
      </div>

      {/* Reset Action */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="h-8.5 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset Filters</span>
      </Button>
    </div>
  );
}
