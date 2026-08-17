/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { ExpenseApprovalModal } from '@/features/expenses/components/expense-approval-modal';
import { ExpenseRecord } from '@/features/expenses/types/expense-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckSquare, Paperclip } from 'lucide-react';

export default function ExpenseApprovalQueuePage() {
  const [expenses, setExpenses] = React.useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedExpense, setSelectedExpense] = React.useState<ExpenseRecord | null>(null);

  const fetchPending = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/expenses?status=PENDING_APPROVAL');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending approval queue:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return (
    <ContentContainer>
      <PageHeader
        title="Expense Approval Queue"
        description="Review pending employee expense claims, inspect receipt file attachments, and approve or reject submissions."
        breadcrumbs={[{ label: 'Expenses', href: '/expenses' }, { label: 'Approval Queue' }]}
        actions={
          <Link href="/expenses">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Expenses</span>
            </Button>
          </Link>
        }
      />

      <div className="mt-4 space-y-6 text-xs">
        <Card className="shadow-2xs border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-amber-500" />
              <span>Pending Claims Review Queue</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {expenses.length} claims awaiting manager review
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading pending approval queue...
              </div>
            ) : expenses.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No pending expense claims! All employee submissions have been reviewed.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Title & Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Vendor / Project</th>
                      <th className="py-3 px-4">Date Submitted</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4 text-right">Amount Claimed</th>
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

                        <td className="py-3 px-4 text-muted-foreground font-semibold">
                          {e.createdByName || e.employee?.fullName || 'Employee'}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-extrabold text-foreground text-sm">
                          ${e.amount.toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedExpense(e)}
                            className="h-7 px-3 text-[11px] bg-primary text-primary-foreground font-bold"
                          >
                            Review & Decide
                          </Button>
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

      {selectedExpense && (
        <ExpenseApprovalModal
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          expense={selectedExpense}
          onReviewed={fetchPending}
        />
      )}
    </ContentContainer>
  );
}
