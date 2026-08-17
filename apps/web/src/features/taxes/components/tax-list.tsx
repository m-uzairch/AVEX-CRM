'use client';

import * as React from 'react';
import { TaxRate, TaxFilterState, TaxType, TaxStatus } from '../types/tax-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface TaxListProps {
  taxes: TaxRate[];
  loading: boolean;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onEditTax: (tax: TaxRate) => void;
  onDeleteTax: (id: string) => Promise<void>;
  onToggleStatus: (tax: TaxRate) => Promise<void>;
  onFilterChange: (filters: TaxFilterState) => void;
}

export function TaxList({
  taxes,
  loading,
  onRefresh,
  onOpenCreateModal,
  onEditTax,
  onDeleteTax,
  onToggleStatus,
  onFilterChange,
}: TaxListProps) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<TaxStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = React.useState<TaxType | 'ALL'>('ALL');

  const handleSearchChange = (val: string) => {
    setSearch(val);
    onFilterChange({ search: val, status: statusFilter, type: typeFilter });
  };

  const handleStatusChange = (val: TaxStatus | 'ALL') => {
    setStatusFilter(val);
    onFilterChange({ search, status: val, type: typeFilter });
  };

  const handleTypeChange = (val: TaxType | 'ALL') => {
    setTypeFilter(val);
    onFilterChange({ search, status: statusFilter, type: val });
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tax rates by name, code..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value as any)}
            className="h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="ALL">All Calculation Types</option>
            <option value="EXCLUSIVE">Exclusive Tax</option>
            <option value="INCLUSIVE">Inclusive Tax</option>
          </select>

          <Button variant="outline" size="sm" onClick={onRefresh} title="Refresh Tax List">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Tax Rate
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tax Name</TableHead>
              <TableHead>Tax Code</TableHead>
              <TableHead>Rate (%)</TableHead>
              <TableHead>Calculation Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading tax rates...
                </TableCell>
              </TableRow>
            ) : taxes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No tax rates found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              taxes.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    {tax.name}
                  </TableCell>
                  <TableCell>
                    {tax.code ? (
                      <code className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-mono">
                        {tax.code}
                      </code>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                    {tax.percentage}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={tax.type === 'EXCLUSIVE' ? 'default' : 'secondary'}>
                      {tax.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        tax.status === 'ACTIVE'
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-900'
                      }
                    >
                      {tax.status === 'ACTIVE' ? (
                        <CheckCircle className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1 inline" />
                      )}
                      {tax.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-slate-500">
                    {tax.description || 'No description provided'}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(tax)}
                      title={tax.status === 'ACTIVE' ? 'Set Inactive' : 'Set Active'}
                    >
                      {tax.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditTax(tax)}
                      title="Edit Tax Rate"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => onDeleteTax(tax.id)}
                      title="Soft Delete Tax Rate"
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
