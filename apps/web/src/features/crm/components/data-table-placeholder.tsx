/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { EmptyState } from './empty-state';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnDefinition<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTablePlaceholderProps<T> {
  columns: ColumnDefinition<T>[];
  data?: T[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  onAddNew?: () => void;
  addNewLabel?: string;
  className?: string;
}

export function DataTablePlaceholder<T extends Record<string, any>>({
  columns,
  data = [],
  emptyTitle = 'No records found',
  emptyDescription = 'Get started by creating your first record in this CRM section.',
  emptyIcon = <Inbox className="h-6 w-6" />,
  onAddNew,
  addNewLabel = 'Add New',
  className,
}: DataTablePlaceholderProps<T>) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onAddNew ? addNewLabel : undefined}
        onAction={onAddNew}
        className={className}
      />
    );
  }

  return (
    <div className={cn('rounded-lg border border-border bg-card overflow-hidden shadow-xs', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={cn('px-4 py-3', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-accent/40 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn('px-4 py-3 text-foreground', col.className)}>
                    {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '') : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Placeholder Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card text-xs text-muted-foreground">
        <span>Showing 1 to {data.length} of {data.length} entries</span>
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-border" disabled>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-border bg-primary/10 text-primary font-bold">
            1
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-border" disabled>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
