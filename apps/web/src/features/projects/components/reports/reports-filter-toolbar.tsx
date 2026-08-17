/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ReportFilterState, DateRangeOption } from '../../types/project-report-types';
import { Search, Filter, RotateCcw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReportsFilterToolbarProps {
  filters: ReportFilterState;
  onFilterChange: (filters: ReportFilterState) => void;
  onReset: () => void;
  projects?: { id: string; name: string; projectCode: string }[];
  employees?: { id: string; fullName: string }[];
}

export function ReportsFilterToolbar({
  filters,
  onFilterChange,
  onReset,
  projects = [],
  employees = [],
}: ReportsFilterToolbarProps) {
  const handleChange = (field: keyof ReportFilterState, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search project name, code, client or employee..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value as DateRangeOption)}
            className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_QUARTER">This Quarter</option>
            <option value="THIS_YEAR">This Year</option>
          </select>
        </div>

        {/* Reset Filters */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Filters
        </Button>
      </div>

      {/* Filter Dropdowns Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 border-t border-border/60 text-xs">
        {/* Project Selector */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Project</label>
          <select
            value={filters.projectId || 'ALL'}
            onChange={(e) => handleChange('projectId', e.target.value)}
            className="w-full h-8 px-2 text-xs bg-background border border-input rounded-md text-foreground"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectCode} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Manager Selector */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Manager</label>
          <select
            value={filters.projectManagerId || 'ALL'}
            onChange={(e) => handleChange('projectManagerId', e.target.value)}
            className="w-full h-8 px-2 text-xs bg-background border border-input rounded-md text-foreground"
          >
            <option value="ALL">All Managers</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Selector */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Employee</label>
          <select
            value={filters.employeeId || 'ALL'}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            className="w-full h-8 px-2 text-xs bg-background border border-input rounded-md text-foreground"
          >
            <option value="ALL">All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Status</label>
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full h-8 px-2 text-xs bg-background border border-input rounded-md text-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">Priority</label>
          <select
            value={filters.priority || 'ALL'}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full h-8 px-2 text-xs bg-background border border-input rounded-md text-foreground"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Filter Quick Tag */}
        <div className="flex items-end">
          <div className="w-full h-8 flex items-center justify-center gap-1 text-[11px] text-muted-foreground bg-muted/40 rounded-md border border-border/40 font-medium">
            <Filter className="h-3 w-3 text-primary" />
            <span>Combined Filters</span>
          </div>
        </div>
      </div>
    </div>
  );
}
