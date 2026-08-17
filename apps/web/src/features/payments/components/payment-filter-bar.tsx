/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';
import { PaymentFilterState } from '../types/payment-types';

interface PaymentFilterBarProps {
  filters: PaymentFilterState;
  onFilterChange: (newFilters: PaymentFilterState) => void;
  onReset: () => void;
}

export function PaymentFilterBar({ filters, onFilterChange, onReset }: PaymentFilterBarProps) {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search invoice #, reference #, customer name..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9 h-8.5 text-xs bg-background"
          />
        </div>

        {/* Payment Method Select */}
        <select
          value={filters.paymentMethod || 'ALL'}
          onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value })}
          className="flex h-8.5 w-44 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CASH">Cash</option>
          <option value="CHEQUE">Cheque</option>
          <option value="CREDIT_CARD">Credit Card</option>
          <option value="DEBIT_CARD">Debit Card</option>
          <option value="MOBILE_WALLET">Mobile Wallet</option>
          <option value="OTHER">Other</option>
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
