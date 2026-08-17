/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReportFilterState } from '../types/report-types';
import { Filter, RotateCcw } from 'lucide-react';

interface ReportFilterBarProps {
  filters: ReportFilterState;
  onChange: (filters: ReportFilterState) => void;
  onReset: () => void;
}

export function ReportFilterBar({ filters, onChange, onReset }: ReportFilterBarProps) {
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/crm/customers')
      .then((res) => res.json())
      .then((data) => setCustomers(data.data || []))
      .catch(() => {});

    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data.data || []))
      .catch(() => {});
  }, []);

  const selectClassName = "flex h-8 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="flex flex-wrap items-center gap-2 bg-card p-3 rounded-lg border border-border/50 text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
        <Filter className="h-3.5 w-3.5" />
        <span className="font-semibold text-foreground text-xs">Filters:</span>
      </div>

      <div>
        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...filters, startDate: e.target.value })}
          className="h-8 text-xs w-36"
        />
      </div>

      <span className="text-muted-foreground">to</span>

      <div>
        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...filters, endDate: e.target.value })}
          className="h-8 text-xs w-36"
        />
      </div>

      <div>
        <select
          value={filters.customerId || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...filters, customerId: e.target.value || undefined })}
          className={`${selectClassName} w-44`}
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.companyName})
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          value={filters.projectId || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...filters, projectId: e.target.value || undefined })}
          className={`${selectClassName} w-44`}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.projectCode})
            </option>
          ))}
        </select>
      </div>

      <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
        <RotateCcw className="h-3 w-3" /> Reset
      </Button>
    </div>
  );
}
