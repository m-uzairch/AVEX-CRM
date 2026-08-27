/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PaymentKPISummaryCards } from './payment-kpi-summary';
import { PaymentFilterBar } from './payment-filter-bar';
import { RecordPaymentModal } from '@/features/invoices/components/record-payment-modal';
import { PaymentRecord, PaymentFilterState, PaymentKPISummary } from '../types/payment-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export function PaymentsDashboardView() {
  const toastCtx = useToast();
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [summary, setSummary] = React.useState<PaymentKPISummary>({
    totalCollected: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    totalPaymentsCount: 0,
    openInvoicesCount: 0,
    overdueInvoicesCount: 0,
  });

  const [filters, setFilters] = React.useState<PaymentFilterState>({
    search: '',
    paymentMethod: 'ALL',
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);

  const fetchPayments = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.paymentMethod && filters.paymentMethod !== 'ALL') params.set('paymentMethod', filters.paymentMethod);

      const res = await fetch(`/api/payments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDelete = async (id: string, refNum?: string | null) => {
    if (!confirm(`Are you sure you want to soft-delete this payment record${refNum ? ` (${refNum})` : ''}?`)) return;

    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toastCtx.success('Payment Deleted', 'Payment record soft-deleted and invoice balances updated.');
        fetchPayments();
      } else {
        toastCtx.error('Delete Error', 'Failed to soft delete payment.');
      }
    } catch (err) {
      console.error('Delete payment failed:', err);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Action Row in tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <span>Payment Tracking & Receipts</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Monitor client collections, manual receipts, partial payments, and overdue balances.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/payments/outstanding">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>Outstanding & Aging</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setIsRecordModalOpen(true)}
            className="h-9 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <PaymentKPISummaryCards summary={summary} />

      {/* Filter Bar */}
      <PaymentFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ search: '', paymentMethod: 'ALL' })}
      />

      {/* Payments History Table */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span>Payment Receipts & Audit History</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {payments.length} payment records in workspace
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
              Loading payment records...
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-3">
              <div>No payment records match your filters.</div>
              <Button size="sm" variant="outline" onClick={() => setIsRecordModalOpen(true)}>
                Record a client payment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt / Ref #</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Recorded By</th>
                    <th className="py-3 px-4 text-right">Amount Received</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {p.referenceNumber || 'PAY-RECEIPT'}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        <Link href={`/invoices/${p.invoiceId}`} className="hover:underline">
                          {p.invoice?.invoiceNumber || 'INV'}
                        </Link>
                      </td>

                      <td className="py-3 px-4 font-bold text-foreground">
                        {p.customer?.companyName || p.customer?.name || 'Customer'}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {p.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {p.recordedByName || 'System User'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        +${p.amount.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id, p.referenceNumber)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                          title="Soft Delete Payment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <RecordPaymentModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          invoiceId=""
          invoiceNumber=""
          remainingBalance={0}
          onPaymentRecorded={fetchPayments}
        />
      )}
    </div>
  );
}
