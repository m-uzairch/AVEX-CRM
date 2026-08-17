'use client';

import * as React from 'react';
import { DiscountRule } from '../types/tax-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Calendar, Zap } from 'lucide-react';

interface DiscountRulesPageProps {
  rules: DiscountRule[];
  loading: boolean;
  onOpenCreateModal: () => void;
  onEditRule: (rule: DiscountRule) => void;
  onDeleteRule: (id: string) => Promise<void>;
}

export function DiscountRulesPage({
  rules,
  loading,
  onOpenCreateModal,
  onEditRule,
  onDeleteRule,
}: DiscountRulesPageProps) {
  const formatDateDisplay = (dateStr?: string | null) => {
    if (!dateStr) return 'Ongoing (No Limit)';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" /> Automated & Promotional Discount Rules
          </h3>
          <p className="text-sm text-slate-500">
            Define promotional discount triggers such as Early Payment rebates (e.g. 2/10 Net 30), seasonal campaign discounts, and contract renewal bonuses.
          </p>
        </div>

        <Button onClick={onOpenCreateModal}>
          <Plus className="h-4 w-4 mr-2" /> Create Rule
        </Button>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Discount Value</TableHead>
              <TableHead>Validity Period</TableHead>
              <TableHead>Rule Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Loading discount rules...
                </TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No discount rules configured yet. Click above to add one.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    {rule.name}
                  </TableCell>
                  <TableCell className="font-bold text-amber-600 dark:text-amber-400">
                    {rule.type === 'PERCENTAGE' ? `${rule.value}%` : `$${rule.value}`}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-3.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {formatDateDisplay(rule.startDate)} → {formatDateDisplay(rule.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        rule.status === 'ACTIVE'
                          ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                          : rule.status === 'EXPIRED'
                          ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                          : 'border-slate-400 text-slate-500'
                      }
                    >
                      {rule.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-slate-500">
                    {rule.description || 'No details provided'}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditRule(rule)}
                      title="Edit Rule"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => onDeleteRule(rule.id)}
                      title="Delete Rule"
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
