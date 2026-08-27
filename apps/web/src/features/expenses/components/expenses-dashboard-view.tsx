/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ExpenseKPISummaryCards } from './expense-kpi-summary';
import { ExpenseFilterBar } from './expense-filter-bar';
import { CreateExpenseModal } from './create-expense-modal';
import { ExpenseApprovalModal } from './expense-approval-modal';
import { ExpenseRecord, ExpenseCategory, Vendor, ExpenseFilterState, ExpenseKPISummary } from '../types/expense-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, Receipt, Building2, CheckSquare, Paperclip } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export function ExpensesDashboardView() {
  const toastCtx = useToast();
  const [expenses, setExpenses] = React.useState<ExpenseRecord[]>([]);
  const [categories, setCategories] = React.useState<ExpenseCategory[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);

  const [summary, setSummary] = React.useState<ExpenseKPISummary>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    pendingApprovalsCount: 0,
    pendingApprovalsValue: 0,
    approvedCount: 0,
    approvedValue: 0,
    rejectedCount: 0,
    projectExpensesValue: 0,
  });

  const [filters, setFilters] = React.useState<ExpenseFilterState>({
    search: '',
    categoryId: 'ALL',
    status: 'ALL',
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedReviewExpense, setSelectedReviewExpense] = React.useState<ExpenseRecord | null>(null);

  const fetchExpensesAndMetadata = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.categoryId && filters.categoryId !== 'ALL') params.set('categoryId', filters.categoryId);
      if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.vendorId) params.set('vendorId', filters.vendorId);

      const [resExp, resCats, resVendors] = await Promise.all([
        fetch(`/api/expenses?${params.toString()}`),
        fetch('/api/expenses/categories'),
        fetch('/api/expenses/vendors'),
      ]);

      if (resExp.ok) {
        const data = await resExp.json();
        setExpenses(data.expenses || []);
        if (data.summary) setSummary(data.summary);
      }
      if (resCats.ok) {
        const data = await resCats.json();
        setCategories(data.categories || []);
      }
      if (resVendors.ok) {
        const data = await resVendors.json();
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.error('Failed to load expense dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchExpensesAndMetadata();
  }, [fetchExpensesAndMetadata]);

  const handleDelete = async (id: string, description: string) => {
    if (!confirm(`Are you sure you want to soft-delete expense record "${description}"?`)) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toastCtx.success('Expense Deleted', 'Expense record soft-deleted successfully.');
        fetchExpensesAndMetadata();
      } else {
        toastCtx.error('Delete Error', 'Failed to delete expense.');
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">APPROVED</Badge>;
      case 'PAID':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-bold">PAID</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-bold">REJECTED</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">PENDING</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Action Row in tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-purple-500" />
            <span>Expense Management System</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Track operational disbursements, receipts, approvals, vendor bills, and project costs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/expenses/approvals">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
              <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
              <span>Approval Queue ({summary.pendingApprovalsCount})</span>
            </Button>
          </Link>

          <Link href="/expenses/vendors">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>Vendors Directory</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Create Expense</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ExpenseKPISummaryCards summary={summary} />

      {/* Filter Bar */}
      <ExpenseFilterBar
        categories={categories}
        vendors={vendors}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ search: '', categoryId: 'ALL', status: 'ALL' })}
      />

      {/* Expenses Table */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span>Disbursement Logs & Claims</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {expenses.length} operating expenses logged
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
              Loading expenses directory...
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-3">
              <div>No expense records found.</div>
              <Button size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                Record first expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Expense Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Vendor / Supplier</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                        <span>{exp.title}</span>
                        {exp.receiptUrl && (
                          <a
                            href={exp.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                            title="View Receipt"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {exp.category ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                            style={{ backgroundColor: exp.category.color }}
                          >
                            {exp.category.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(exp.status)}</td>

                      <td className="py-3 px-4 text-foreground font-medium">
                        {exp.vendor?.name || 'Direct / Internal'}
                      </td>

                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                        {new Date(exp.expenseDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {exp.project?.name || '—'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-foreground">
                        ${exp.amount.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {exp.status === 'PENDING_APPROVAL' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReviewExpense(exp)}
                              className="h-7 px-2 text-[10px] font-bold border-primary/40 text-primary"
                            >
                              Review
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exp.id, exp.title)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                            title="Soft Delete Expense"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateExpenseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          categories={categories}
          vendors={vendors}
          onCreated={fetchExpensesAndMetadata}
        />
      )}

      {/* Review Approval Modal */}
      {selectedReviewExpense && (
        <ExpenseApprovalModal
          isOpen={!!selectedReviewExpense}
          onClose={() => setSelectedReviewExpense(null)}
          expense={selectedReviewExpense}
          onReviewed={fetchExpensesAndMetadata}
        />
      )}
    </div>
  );
}
