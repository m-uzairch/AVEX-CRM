'use client';

import * as React from 'react';
import { Calendar, User, Layers, RotateCcw, Filter, Building2, UserCheck } from 'lucide-react';
import { DashboardFilterState } from '../../types/dashboard-types';

interface DashboardFilterToolbarProps {
  filters: DashboardFilterState;
  onFilterChange: (filters: DashboardFilterState) => void;
  onReset: () => void;
}

export function DashboardFilterToolbar({
  filters,
  onFilterChange,
  onReset,
}: DashboardFilterToolbarProps) {
  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-2xs space-y-3 text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-foreground font-bold text-xs">
          <Filter className="h-4 w-4 text-primary" />
          <span>Dashboard BI Filter Suite</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-1 bg-background border border-input rounded-lg px-2.5 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  dateRange: e.target.value as DashboardFilterState['dateRange'],
                })
              }
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="THIS_YEAR">This Year</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {/* Employee Filter */}
          <div className="flex items-center space-x-1 bg-background border border-input rounded-lg px-2.5 py-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={filters.employeeId}
              onChange={(e) => onFilterChange({ ...filters, employeeId: e.target.value })}
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="ALL">All Sales Reps</option>
              <option value="emp_001">Alex Carter</option>
              <option value="emp_002">Jordan Smith</option>
              <option value="emp_003">Ali Hassan</option>
              <option value="emp_004">Sarah Miller</option>
            </select>
          </div>

          {/* Lead Source Filter */}
          <div className="flex items-center space-x-1 bg-background border border-input rounded-lg px-2.5 py-1.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={filters.leadSource}
              onChange={(e) => onFilterChange({ ...filters, leadSource: e.target.value })}
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="ALL">All Lead Sources</option>
              <option value="Website">Website</option>
              <option value="LinkedIn Outreach">LinkedIn Outreach</option>
              <option value="Referrals">Referrals</option>
              <option value="Inbound Email">Inbound Email</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div className="flex items-center space-x-1 bg-background border border-input rounded-lg px-2.5 py-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={filters.industry}
              onChange={(e) => onFilterChange({ ...filters, industry: e.target.value })}
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="ALL">All Industries</option>
              <option value="Software & Technology">Software & Tech</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare & Pharma">Healthcare & Pharma</option>
              <option value="Logistics & Retail">Logistics & Retail</option>
            </select>
          </div>

          {/* Customer Status Filter */}
          <div className="flex items-center space-x-1 bg-background border border-input rounded-lg px-2.5 py-1.5">
            <UserCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={filters.customerStatus}
              onChange={(e) => onFilterChange({ ...filters, customerStatus: e.target.value })}
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PROSPECT">Prospect</option>
              <option value="INACTIVE">Inactive</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
            title="Reset Dashboard Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
