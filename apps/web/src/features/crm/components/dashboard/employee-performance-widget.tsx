'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Search } from 'lucide-react';
import { EmployeePerformanceItem } from '../../types/dashboard-types';

interface EmployeePerformanceWidgetProps {
  employees: EmployeePerformanceItem[];
  isLoading?: boolean;
}

export function EmployeePerformanceWidget({
  employees,
  isLoading = false,
}: EmployeePerformanceWidgetProps) {
  const [search, setSearch] = React.useState('');

  if (isLoading) {
    return (
      <Card className="shadow-2xs border-border">
        <CardContent className="p-6">
          <div className="animate-pulse bg-muted/40 h-56 rounded-xl border border-border" />
        </CardContent>
      </Card>
    );
  }

  const filtered = employees.filter((e) =>
    e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    (e.jobTitle && e.jobTitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card className="shadow-2xs border-border text-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <span>Employee Sales Performance & Productivity</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Individual team member lead conversions, assigned accounts, and deal throughput.
          </CardDescription>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground font-semibold border-b border-border text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Sales Representative</th>
              <th className="py-3 px-4">Assigned Leads</th>
              <th className="py-3 px-4">Active Customers</th>
              <th className="py-3 px-4">Conversion Rate</th>
              <th className="py-3 px-4">Tasks Done</th>
              <th className="py-3 px-4 text-right">Won Deal Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-medium text-xs">
            {filtered.map((emp) => (
              <tr key={emp.employeeId} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 text-xs shrink-0">
                      {emp.employeeName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{emp.employeeName}</span>
                      <span className="text-[10px] text-muted-foreground block">{emp.jobTitle || 'Account Executive'}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 font-mono">
                  <Badge variant="outline" className="text-[10px]">
                    {emp.assignedLeads} leads
                  </Badge>
                </td>

                <td className="py-3 px-4 font-mono text-foreground">
                  {emp.assignedCustomers} accounts
                </td>

                <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {emp.conversionRate}%
                </td>

                <td className="py-3 px-4 font-mono text-muted-foreground">
                  {emp.completedTasks}
                </td>

                <td className="py-3 px-4 text-right font-mono font-extrabold text-foreground">
                  ${emp.wonDealValue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
