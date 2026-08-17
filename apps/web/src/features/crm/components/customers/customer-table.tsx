/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Customer } from '../../types/customer-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { EmptyState } from '../empty-state';
import {
  Building2,
  Mail,
  Phone,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  MoreVertical,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomerTableProps {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  selectedIds: string[];
  isLoading?: boolean;
  isTrashView?: boolean;
  isArchiveView?: boolean;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'name' | 'companyName' | 'createdAt' | 'updatedAt' | 'status') => void;
  onPageChange?: (page: number) => void;
  onSelectId?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onView?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onArchive?: (customer: Customer) => void;
  onRestore?: (customer: Customer) => void;
  onAddNew?: () => void;
}

export function CustomerTable({
  customers,
  total,
  page,
  pageSize,
  totalPages,
  selectedIds,
  isLoading = false,
  isTrashView = false,
  isArchiveView = false,
  sortField: _sortField = 'createdAt',
  sortOrder: _sortOrder = 'desc',
  onSort,
  onPageChange,
  onSelectId,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onAddNew,
}: CustomerTableProps) {
  const allIdsOnPage = customers.map((c) => c.id);
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id));

  const handleMasterCheckboxChange = () => {
    if (!onSelectAll) return;
    if (isAllSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(allIdsOnPage);
    }
  };

  const statusVariantMap: Record<Customer['status'], 'default' | 'secondary' | 'warning' | 'outline' | 'destructive'> = {
    ACTIVE: 'default',
    INACTIVE: 'outline',
    PROSPECT: 'warning',
    LOST: 'destructive',
    BLACKLISTED: 'destructive',
    ARCHIVED: 'secondary',
  };

  if (!isLoading && (!customers || customers.length === 0)) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title={isTrashView ? 'Trash is Empty' : isArchiveView ? 'No Archived Customers' : 'No Customers Found'}
        description={
          isTrashView
            ? 'Deleted customer records will appear here before permanent deletion.'
            : isArchiveView
            ? 'Archived customer records will appear here.'
            : 'Get started by creating your first customer workspace account.'
        }
        actionLabel={!isTrashView && !isArchiveView && onAddNew ? 'Add Customer' : undefined}
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px] select-none">
            <tr>
              <th className="px-4 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleMasterCheckboxChange}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3.5 cursor-pointer hover:text-foreground" onClick={() => onSort?.('name')}>
                <div className="flex items-center space-x-1">
                  <span>Customer Name</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3.5 cursor-pointer hover:text-foreground" onClick={() => onSort?.('companyName')}>
                <div className="flex items-center space-x-1">
                  <span>Company</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3.5">Contact Info</th>
              <th className="px-4 py-3.5 cursor-pointer hover:text-foreground" onClick={() => onSort?.('status')}>
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3.5">Tags</th>
              <th className="px-4 py-3.5">Assigned Employee</th>
              <th className="px-4 py-3.5 cursor-pointer hover:text-foreground" onClick={() => onSort?.('createdAt')}>
                <div className="flex items-center space-x-1">
                  <span>Created Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3.5 text-right w-12">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {customers.map((cust) => {
              const isSelected = selectedIds.includes(cust.id);
              const initials = cust.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);

              const menuItems = [
                {
                  label: 'View Details',
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => (onView ? onView(cust) : null),
                },
                !isTrashView && {
                  label: 'Edit Customer',
                  icon: <Edit className="h-3.5 w-3.5" />,
                  onClick: () => (onEdit ? onEdit(cust) : null),
                },
                !isTrashView && !cust.isArchived && {
                  label: 'Archive Customer',
                  icon: <Archive className="h-3.5 w-3.5" />,
                  onClick: () => (onArchive ? onArchive(cust) : null),
                },
                !isTrashView && cust.isArchived && {
                  label: 'Unarchive Customer',
                  icon: <RotateCcw className="h-3.5 w-3.5" />,
                  onClick: () => (onArchive ? onArchive(cust) : null),
                },
                isTrashView
                  ? {
                      label: 'Restore Customer',
                      icon: <RotateCcw className="h-3.5 w-3.5" />,
                      onClick: () => (onRestore ? onRestore(cust) : null),
                    }
                  : {
                      label: 'Move to Trash',
                      icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
                      destructive: true,
                      onClick: () => (onDelete ? onDelete(cust) : null),
                    },
              ].filter(Boolean) as any[];

              return (
                <tr
                  key={cust.id}
                  className={cn(
                    'hover:bg-accent/40 transition-colors',
                    isSelected && 'bg-primary/5 hover:bg-primary/10'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectId?.(cust.id)}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                  </td>

                  {/* Customer Name */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/crm/customers/${cust.id}`}
                      className="flex items-center space-x-2.5 group"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                        {initials}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                          {cust.name}
                        </span>
                        {cust.industry && (
                          <span className="text-[10px] text-muted-foreground">{cust.industry}</span>
                        )}
                      </div>
                    </Link>
                  </td>

                  {/* Company Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium text-foreground">{cust.companyName}</span>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-4 py-3 space-y-0.5">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <a href={`mailto:${cust.email}`} className="hover:underline hover:text-foreground">
                        {cust.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      <a href={`tel:${cust.phone}`} className="hover:underline hover:text-foreground">
                        {cust.phone}
                      </a>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge variant={statusVariantMap[cust.status] || 'default'} className="text-[10px]">
                      {cust.status}
                    </Badge>
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {cust.tags && cust.tags.length > 0 ? (
                        cust.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.2 rounded-md font-medium border border-border"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-[10px] italic">No tags</span>
                      )}
                      {cust.tags && cust.tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground font-bold">
                          +{cust.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assigned Employee */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <UserCheck className="h-3.5 w-3.5 shrink-0 text-primary/80" />
                      <span className="truncate max-w-[100px]">
                        {cust.assignedEmployeeName || 'Alex Carter'}
                      </span>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                    {new Date(cust.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions Menu */}
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu
                      trigger={
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                      items={menuItems}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card text-xs text-muted-foreground">
        <span>
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} customers
        </span>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="h-7 w-7 p-0 border-border"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(p)}
              className={cn(
                'h-7 w-7 p-0 border-border font-bold text-xs',
                p === page ? 'bg-primary text-primary-foreground' : 'text-foreground'
              )}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
            className="h-7 w-7 p-0 border-border"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
