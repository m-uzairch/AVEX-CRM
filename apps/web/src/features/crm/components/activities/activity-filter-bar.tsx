'use client';

import * as React from 'react';
import { Search, RotateCcw, Calendar, Layers, Activity } from 'lucide-react';
import { ActivityFilterState } from '../../types/activity-note-types';

interface ActivityFilterBarProps {
  filters: ActivityFilterState;
  onFilterChange: (filters: ActivityFilterState) => void;
  onReset: () => void;
}

export function ActivityFilterBar({
  filters,
  onFilterChange,
  onReset,
}: ActivityFilterBarProps) {
  return (
    <div className="bg-card border border-border p-4 rounded-xl space-y-3 shadow-2xs text-xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activities, users, or descriptions..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter controls group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Module / Category */}
          <div className="flex items-center space-x-1 bg-background border border-input rounded-lg px-2.5 py-1.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={filters.module}
              onChange={(e) => onFilterChange({ ...filters, module: e.target.value, page: 1 })}
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="ALL">All Modules</option>
              <option value="CUSTOMERS">Customers</option>
              <option value="LEADS">Leads & Pipeline</option>
              <option value="PROJECTS">Projects</option>
              <option value="INVOICES">Invoices</option>
              <option value="MEETINGS">Meetings</option>
              <option value="SYSTEM">System Audit</option>
            </select>
          </div>

          {/* Action Type */}
          <div className="flex items-center space-x-1 bg-background border border-input rounded-lg px-2.5 py-1.5">
            <Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={filters.action}
              onChange={(e) => onFilterChange({ ...filters, action: e.target.value, page: 1 })}
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="ALL">All Actions</option>
              <option value="CUSTOMER_CREATED">Customer Created</option>
              <option value="CUSTOMER_UPDATED">Customer Updated</option>
              <option value="LEAD_CREATED">Lead Created</option>
              <option value="LEAD_STAGE_CHANGED">Stage Changed</option>
              <option value="LEAD_CONVERTED">Lead Converted</option>
              <option value="NOTE_ADDED">Note Added</option>
              <option value="EMPLOYEE_ASSIGNED">Employee Assigned</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-1 bg-background border border-input rounded-lg px-2.5 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  dateRange: e.target.value as ActivityFilterState['dateRange'],
                  page: 1,
                })
              }
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
              <option value="90_DAYS">Last 90 Days</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
