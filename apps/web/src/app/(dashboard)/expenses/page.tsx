/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { ExpenseKPISummaryCards } from '@/features/expenses/components/expense-kpi-summary';
import { ExpenseFilterBar } from '@/features/expenses/components/expense-filter-bar';
import { CreateExpenseModal } from '@/features/expenses/components/create-expense-modal';
import { ExpenseApprovalModal } from '@/features/expenses/components/expense-approval-modal';
import { ExpenseRecord, ExpenseCategory, Vendor, ExpenseFilterState, ExpenseKPISummary } from '@/features/expenses/types/expense-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, Receipt, Building2, CheckSquare, Paperclip } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export default function ExpensesDashboardPage() {
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
      console.error('Failed to fetch expenses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchExpensesAndMetadata();
  }, [fetchExpensesAndMetadata]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to soft-delete expense "${title}"?`)) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toastCtx.success('Expense Deleted', `Soft-deleted expense "${title}".`);
        fetchExpensesAndMetadata();
      } else {
        toastCtx.error('Delete Error', 'Failed to delete expense.');
      }
    } catch (err) {
      console.error('Delete expense failed:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">APPROVED</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">PENDING APPROVAL</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-bold">REJECTED</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[10px] font-bold">DRAFT</Badge>;
    }
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Expense Management System"
        description="Record, categorize, approve, and monitor company expenses, project budget impacts, vendor claims, and receipts."
        breadcrumbs={[{ label: 'Expenses' }]}
        actions={
          <div className="flex items-center space-x-2">
            <Link href="/expenses/approvals">
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
                <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
                <span>Approval Queue ({summary.pendingApprovalsCount})</span>
              </Button>
            </Link>

            <Link href="/expenses/vendors">
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
                <Building2 className="h-3.5 w-3.5 text-blue-500" />
                <span>Vendor Directory</span>
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-9 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>Record Expense</span>
            </Button>
          </div>
        }
      />

      <div className="space-y-6 text-xs mt-4">
        {/* KPI Summary Cards */}
        <ExpenseKPISummaryCards summary={summary} />

        {/* Filter Bar */}
        <ExpenseFilterBar
          filters={filters}
          categories={categories}
          vendors={vendors}
          onFilterChange={setFilters}
          onReset={() => setFilters({ search: '', categoryId: 'ALL', status: 'ALL' })}
        />

        {/* Expenses List Table */}
        <Card className="shadow-2xs border-border">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span>Expense Claims & Records</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Showing {expenses.length} expense records
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading expense records...
              </div>
            ) : expenses.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-3">
                <div>No expenses match your filters.</div>
                <Button size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                  Record an expense claim
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Title & Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Vendor / Project</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">
                          <div className="flex items-center space-x-1.5">
                            <span>{e.title}</span>
                            {e.receiptUrl && (
                              <span title="Has receipt attachment">
                                <Paperclip className="h-3 w-3 text-primary shrink-0" />
                              </span>
                            )}
                          </div>
                          {e.description && (
                            <div className="text-[10px] text-muted-foreground font-normal truncate max-w-[200px]">
                              {e.description}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
                            style={{
                              backgroundColor: `${e.category?.color || '#3B82F6'}15`,
                              color: e.category?.color || '#3B82F6',
                            }}
                          >
                            {e.category?.name || 'General'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-muted-foreground">
                          {e.vendor?.name && <div className="font-semibold text-foreground">{e.vendor.name}</div>}
                          {e.project?.projectCode && (
                            <div className="text-[10px] font-mono text-primary">{e.project.projectCode}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                          {new Date(e.expenseDate).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-muted-foreground">
                          {e.createdByName || e.employee?.fullName || 'Employee'}
                        </td>

                        <td className="py-3 px-4">{getStatusBadge(e.status)}</td>

                        <td className="py-3 px-4 text-right font-mono font-extrabold text-foreground">
                          ${e.amount.toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {e.status === 'PENDING_APPROVAL' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReviewExpense(e)}
                                className="h-7 text-[11px] text-amber-600 border-amber-200 hover:bg-amber-50 font-bold"
                              >
                                Review
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(e.id, e.title)}
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
      </div>

      {/* Create Expense Modal */}
      {isCreateModalOpen && (
        <CreateExpenseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          categories={categories}
          vendors={vendors}
          onCreated={fetchExpensesAndMetadata}
        />
      )}

      {/* Review & Approve Modal */}
      {selectedReviewExpense && (
        <ExpenseApprovalModal
          isOpen={!!selectedReviewExpense}
          onClose={() => setSelectedReviewExpense(null)}
          expense={selectedReviewExpense}
          onReviewed={fetchExpensesAndMetadata}
        />
      )}
    </ContentContainer>
  );
}
