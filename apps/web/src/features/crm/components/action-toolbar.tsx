'use client';

import * as React from 'react';
import { SearchBar } from './search-bar';
import { FilterDropdown, FilterOption } from './filter-dropdown';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterOptions?: FilterOption[];
  selectedFilterId?: string;
  onFilterSelect?: (id: string) => void;
  onExport?: () => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  className?: string;
}

export function ActionToolbar({
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  filterOptions,
  selectedFilterId,
  onFilterSelect,
  onExport,
  onAddNew,
  addNewLabel = 'Add New',
  className,
}: ActionToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60',
        className
      )}
    >
      {/* Search Input */}
      <SearchBar
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={onSearchChange}
        className="w-full sm:max-w-xs"
      />

      {/* Action Controls */}
      <div className="flex items-center justify-end space-x-2 shrink-0">
        <FilterDropdown
          options={filterOptions}
          selectedId={selectedFilterId}
          onSelect={onFilterSelect}
        />

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 px-3 text-xs flex items-center space-x-1.5 border-border"
            type="button"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        {onAddNew && (
          <Button
            size="sm"
            onClick={onAddNew}
            className="h-9 px-3.5 text-xs flex items-center space-x-1.5 font-medium shadow-xs"
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{addNewLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
