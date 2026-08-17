/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { InvoiceKPISummaryCards } from '@/features/invoices/components/invoice-kpi-summary';
import { InvoiceFilterBar } from '@/features/invoices/components/invoice-filter-bar';
import { RecordPaymentModal } from '@/features/invoices/components/record-payment-modal';
import { EmailInvoiceModal } from '@/features/invoices/components/email-invoice-modal';
import { Invoice, InvoiceFilterState, InvoiceKPISummary } from '@/features/invoices/types/invoice-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, DollarSign, Mail, Trash2, Loader2, Edit, Palette } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export default function InvoicesPage() {
  const toastCtx = useToast();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [summary, setSummary] = React.useState<InvoiceKPISummary>({
    totalInvoicesCount: 0,
    totalBilledRevenue: 0,
    totalPaidAmount: 0,
    totalOutstandingBalance: 0,
    overdueAmount: 0,
    draftCount: 0,
    sentCount: 0,
    paidCount: 0,
    overdueCount: 0,
  });
  const [filters, setFilters] = React.useState<InvoiceFilterState>({
    search: '',
    status: 'ALL',
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal States
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);

  const fetchInvoices = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.append('search', filters.search);
      if (filters.status && filters.status !== 'ALL') query.append('status', filters.status);

      const res = await fetch(`/api/invoices?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toastCtx.success('Invoice Deleted', `Invoice ${invoiceNumber} deleted successfully.`);
        fetchInvoices();
      } else {
        toastCtx.error('Delete Failed', 'Failed to delete invoice.');
      }
    } catch (err) {
      console.error('Delete invoice failed:', err);
      toastCtx.error('Delete Error', 'Failed to delete invoice.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">PAID</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-bold">PARTIALLY PAID</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-bold">OVERDUE</Badge>;
      case 'SENT':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-bold">SENT</Badge>;
      case 'VIEWED':
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px] font-bold">VIEWED</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[10px] font-bold">CANCELLED</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">DRAFT</Badge>;
    }
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Invoices & Payments"
        description="Create, manage, email, print, and track billing invoices and client payment receipts."
        breadcrumbs={[{ label: 'Invoices' }]}
        actions={
          <div className="flex items-center space-x-2">
            <Link href="/invoices/templates">
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
                <Palette className="h-3.5 w-3.5 text-primary" />
                <span>Invoice Designer</span>
              </Button>
            </Link>

            <Link href="/invoices/new">
              <Button size="sm" className="h-9 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                <Plus className="h-4 w-4" />
                <span>Create Invoice</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6 text-xs mt-4">
        {/* KPI Summary Cards */}
        <InvoiceKPISummaryCards summary={summary} />

        {/* Filter Bar */}
        <InvoiceFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({ search: '', status: 'ALL' })}
        />

        {/* Invoices List Table */}
        <Card className="shadow-2xs border-border">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Invoice Management Directory</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time tracking of generated invoices, client balances, and payment history.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading invoice records...
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No invoices found matching current filter criteria.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-3">Customer / Client</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Issue Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Grand Total</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/invoices/${inv.id}`} className="group">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors font-mono">
                            {inv.invoiceNumber}
                          </div>
                        </Link>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">
                          {inv.customer?.companyName || inv.customer?.name || 'Unassigned'}
                        </div>
                        {inv.project && (
                          <div className="text-[10px] text-muted-foreground">
                            Project: {inv.project.name}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">{getStatusBadge(inv.status)}</td>

                      <td className="py-3 px-3 text-muted-foreground font-mono">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                        ${inv.grandTotal.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                        ${inv.remainingBalance.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link href={`/invoices/${inv.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View Invoice">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </Link>

                          <Link href={`/invoices/${inv.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit Invoice">
                              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsEmailModalOpen(true);
                            }}
                            className="h-7 w-7 p-0"
                            title="Email Invoice"
                          >
                            <Mail className="h-3.5 w-3.5 text-blue-500" />
                          </Button>

                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsPaymentModalOpen(true);
                              }}
                              className="h-7 w-7 p-0"
                              title="Record Payment"
                            >
                              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.invoiceNumber}
          remainingBalance={selectedInvoice.remainingBalance}
          onPaymentRecorded={fetchInvoices}
        />
      )}

      {/* Email Invoice Modal */}
      {selectedInvoice && (
        <EmailInvoiceModal
          isOpen={isEmailModalOpen}
          onClose={() => {
            setIsEmailModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.invoiceNumber}
          customerEmail={selectedInvoice.customer?.email}
          customerName={selectedInvoice.customer?.name}
          onEmailSent={fetchInvoices}
        />
      )}
    </ContentContainer>
  );
}
