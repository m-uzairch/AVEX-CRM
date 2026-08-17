'use client';

import * as React from 'react';
import { CustomerFilterState, CustomerStatus } from '../../types/customer-types';
import { FilterDropdown, FilterOption } from '../filter-dropdown';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomerFiltersBarProps {
  filters: CustomerFilterState;
  onFilterChange: (newFilters: Partial<CustomerFilterState>) => void;
  onResetFilters: () => void;
  className?: string;
}

const statusOptions: FilterOption[] = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'PROSPECT', label: 'Prospect' },
  { id: 'INACTIVE', label: 'Inactive' },
  { id: 'LOST', label: 'Lost' },
  { id: 'BLACKLISTED', label: 'Blacklisted' },
];

const industryOptions: FilterOption[] = [
  { id: 'ALL', label: 'All Industries' },
  { id: 'Software & Technology', label: 'Software & Tech' },
  { id: 'Financial Technology', label: 'Financial Tech' },
  { id: 'Logistics & Supply Chain', label: 'Logistics' },
  { id: 'Healthcare & Life Sciences', label: 'Healthcare' },
  { id: 'Retail & E-commerce', label: 'Retail' },
];

const tagOptions: FilterOption[] = [
  { id: 'ALL', label: 'All Tags' },
  { id: 'VIP', label: 'VIP' },
  { id: 'High Paying', label: 'High Paying' },
  { id: 'Enterprise', label: 'Enterprise' },
  { id: 'Startup', label: 'Startup' },
  { id: 'Hot Lead', label: 'Hot Lead' },
  { id: 'Follow Up', label: 'Follow Up' },
];

export function CustomerFiltersBar({
  filters,
  onFilterChange,
  onResetFilters,
  className,
}: CustomerFiltersBarProps) {
  const hasActiveFilters =
    filters.status !== 'ALL' ||
    filters.industry !== 'ALL' ||
    filters.tag !== 'ALL' ||
    filters.search !== '';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 p-2.5 rounded-lg border border-border bg-card/60',
        className
      )}
    >
      <span className="text-xs font-semibold text-muted-foreground mr-1">Filter By:</span>

      {/* Status Dropdown */}
      <FilterDropdown
        label="Status"
        options={statusOptions}
        selectedId={filters.status}
        onSelect={(id) => onFilterChange({ status: id as CustomerStatus | 'ALL' })}
      />

      {/* Industry Dropdown */}
      <FilterDropdown
        label="Industry"
        options={industryOptions}
        selectedId={filters.industry}
        onSelect={(id) => onFilterChange({ industry: id })}
      />

      {/* Tags Dropdown */}
      <FilterDropdown
        label="Tag"
        options={tagOptions}
        selectedId={filters.tag}
        onSelect={(id) => onFilterChange({ tag: id })}
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground ml-auto"
          type="button"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );
}
