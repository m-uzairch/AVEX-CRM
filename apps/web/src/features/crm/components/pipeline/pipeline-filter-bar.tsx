'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import { PipelineFilterOptions } from '../../types/pipeline-types';
import { defaultLeadSources } from '../../services/lead-service';

interface PipelineFilterBarProps {
  filters: PipelineFilterOptions;
  employees?: Array<{ id: string; fullName: string; email: string }>;
  onFilterChange: (newFilters: Partial<PipelineFilterOptions>) => void;
  onResetFilters: () => void;
}

export function PipelineFilterBar({
  filters,
  employees = [],
  onFilterChange,
  onResetFilters,
}: PipelineFilterBarProps) {
  const activeCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== '' &&
      value !== 'ALL' &&
      key !== 'sortField' &&
      key !== 'sortOrder'
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-2.5 bg-muted/40 p-2.5 rounded-xl border border-border/60 text-xs">
      <div className="flex items-center text-muted-foreground font-semibold mr-1">
        <Filter className="h-3.5 w-3.5 mr-1 text-primary" />
        <span>Pipeline Filters:</span>
      </div>

      {/* Priority Filter */}
      <select
        value={filters.priority || 'ALL'}
        onChange={(e) => onFilterChange({ priority: e.target.value as any })}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="ALL">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      {/* Assigned Employee Filter */}
      <select
        value={filters.assignedEmployeeId || 'ALL'}
        onChange={(e) => onFilterChange({ assignedEmployeeId: e.target.value })}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="ALL">All Employees</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.fullName}
          </option>
        ))}
      </select>

      {/* Source Filter */}
      <select
        value={filters.source || 'ALL'}
        onChange={(e) => onFilterChange({ source: e.target.value })}
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
        onChange={(e) => onFilterChange({ scoreRange: e.target.value })}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="ALL">All Scores</option>
        <option value="VERY_HOT">Very Hot (76-100)</option>
        <option value="HOT">Hot (51-75)</option>
        <option value="WARM">Warm (26-50)</option>
        <option value="COLD">Cold (0-25)</option>
      </select>

      {/* Sort Field Selector */}
      <div className="flex items-center space-x-1 ml-auto">
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
        <select
          value={filters.sortField || 'createdAt'}
          onChange={(e) => onFilterChange({ sortField: e.target.value as any })}
          className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="createdAt">Date Created</option>
          <option value="expectedDealValue">Deal Value</option>
          <option value="score">Lead Score</option>
          <option value="name">Lead Name</option>
        </select>
        <select
          value={filters.sortOrder || 'desc'}
          onChange={(e) => onFilterChange({ sortOrder: e.target.value as any })}
          className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {/* Reset Button */}
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
}
