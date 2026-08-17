'use client';

import * as React from 'react';
import { Discount, DiscountFilterState, DiscountType, TaxStatus, DiscountApplicableTo } from '../types/tax-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit2, Trash2, Tag } from 'lucide-react';

interface DiscountListProps {
  discounts: Discount[];
  loading: boolean;
  onOpenCreateModal: () => void;
  onEditDiscount: (discount: Discount) => void;
  onDeleteDiscount: (id: string) => Promise<void>;
  onFilterChange: (filters: DiscountFilterState) => void;
}

export function DiscountList({
  discounts,
  loading,
  onOpenCreateModal,
  onEditDiscount,
  onDeleteDiscount,
  onFilterChange,
}: DiscountListProps) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<TaxStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = React.useState<DiscountType | 'ALL'>('ALL');
  const [applicableFilter, setApplicableFilter] = React.useState<DiscountApplicableTo | 'ALL'>('ALL');

  const handleSearchChange = (val: string) => {
    setSearch(val);
    onFilterChange({ search: val, status: statusFilter, type: typeFilter, applicableTo: applicableFilter });
  };

  const handleStatusChange = (val: TaxStatus | 'ALL') => {
    setStatusFilter(val);
    onFilterChange({ search, status: val, type: typeFilter, applicableTo: applicableFilter });
  };

  const handleTypeChange = (val: DiscountType | 'ALL') => {
    setTypeFilter(val);
    onFilterChange({ search, status: statusFilter, type: val, applicableTo: applicableFilter });
  };

  const handleApplicableChange = (val: DiscountApplicableTo | 'ALL') => {
    setApplicableFilter(val);
    onFilterChange({ search, status: statusFilter, type: typeFilter, applicableTo: val });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search discounts..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value as any)}
            className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="ALL">All Types (% / $)</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount ($)</option>
          </select>

          <select
            value={applicableFilter}
            onChange={(e) => handleApplicableChange(e.target.value as any)}
            className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="ALL">All Applications</option>
            <option value="INVOICE">Invoices</option>
            <option value="QUOTATION">Quotations</option>
            <option value="LINE_ITEM">Line Items</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <Button onClick={onOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Discount
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Discount Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Applicable To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading discounts...
                </TableCell>
              </TableRow>
            ) : discounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No discounts found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-500" />
                    {discount.name}
                  </TableCell>
                  <TableCell>
                    {discount.code ? (
                      <code className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-mono">
                        {discount.code}
                      </code>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                    {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={discount.type === 'PERCENTAGE' ? 'default' : 'secondary'}>
                      {discount.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {discount.applicableTo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        discount.status === 'ACTIVE'
                          ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-slate-400 text-slate-500 bg-slate-50'
                      }
                    >
                      {discount.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditDiscount(discount)}
                      title="Edit Discount"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => onDeleteDiscount(discount.id)}
                      title="Delete Discount"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
