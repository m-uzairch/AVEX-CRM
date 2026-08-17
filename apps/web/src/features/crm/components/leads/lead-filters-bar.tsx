'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw, Archive, Trash2 } from 'lucide-react';
import { LeadFilters } from '../../types/lead-types';
import { defaultLeadSources } from '../../services/lead-service';

interface LeadFiltersBarProps {
  filters: LeadFilters;
  onFilterChange: (newFilters: Partial<LeadFilters>) => void;
  onResetFilters: () => void;
}

export function LeadFiltersBar({
  filters,
  onFilterChange,
  onResetFilters,
}: LeadFiltersBarProps) {
  const activeCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== '' &&
      value !== 'ALL' &&
      key !== 'page' &&
      key !== 'pageSize' &&
      key !== 'sortField' &&
      key !== 'sortOrder'
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-2.5 bg-muted/40 p-2.5 rounded-lg border border-border/60 text-xs">
      <div className="flex items-center text-muted-foreground font-medium mr-1">
        <Filter className="h-3.5 w-3.5 mr-1 text-primary" />
        <span>Filters:</span>
      </div>

      {/* Status Filter */}
      <select
        value={filters.status || 'ALL'}
        onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="ALL">All Statuses</option>
        <option value="NEW">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="QUALIFIED">Qualified</option>
        <option value="PROPOSAL_SENT">Proposal Sent</option>
        <option value="NEGOTIATION">Negotiation</option>
        <option value="WON">Won (Converted)</option>
        <option value="LOST">Lost</option>
      </select>

      {/* Priority Filter */}
      <select
        value={filters.priority || 'ALL'}
        onChange={(e) => onFilterChange({ priority: e.target.value, page: 1 })}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="ALL">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      {/* Source Filter */}
      <select
        value={filters.source || 'ALL'}
        onChange={(e) => onFilterChange({ source: e.target.value, page: 1 })}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="ALL">All Sources</option>
        {defaultLeadSources.map((src) => (
          <option key={src} value={src}>
            {src}
          </option>
        ))}
      </select>

      {/* Score Range Filter */}
      <select
        value={filters.scoreRange || 'ALL'}
        onChange={(e) => onFilterChange({ scoreRange: e.target.value, page: 1 })}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="ALL">All Scores</option>
        <option value="VERY_HOT">Very Hot (76-100)</option>
        <option value="HOT">Hot (51-75)</option>
        <option value="WARM">Warm (26-50)</option>
        <option value="COLD">Cold (0-25)</option>
      </select>

      {/* Archived Toggle Button */}
      <Button
        variant={filters.isArchived ? 'secondary' : 'outline'}
        size="sm"
        className="h-8 text-xs px-2.5 gap-1.5"
        onClick={() =>
          onFilterChange({
            isArchived: !filters.isArchived,
            isDeleted: false,
            page: 1,
          })
        }
      >
        <Archive className="h-3.5 w-3.5" />
        <span>{filters.isArchived ? 'Showing Archived' : 'Archived'}</span>
      </Button>

      {/* Deleted Toggle Button */}
      <Button
        variant={filters.isDeleted ? 'destructive' : 'outline'}
        size="sm"
        className="h-8 text-xs px-2.5 gap-1.5"
        onClick={() =>
          onFilterChange({
            isDeleted: !filters.isDeleted,
            isArchived: false,
            page: 1,
          })
        }
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>{filters.isDeleted ? 'Showing Deleted' : 'Trash'}</span>
      </Button>

      {/* Reset Button */}
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );
}
