/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { InvoicePreviewCard } from '@/features/invoices/components/invoice-preview-card';
import { RecordPaymentModal } from '@/features/invoices/components/record-payment-modal';
import { EmailInvoiceModal } from '@/features/invoices/components/email-invoice-modal';
import { Invoice } from '@/features/invoices/types/invoice-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Mail, DollarSign, Edit, Trash2, ArrowLeft, Loader2, CreditCard, Download } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toastCtx = useToast();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);

  const fetchInvoice = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data.invoice);
      } else {
        toastCtx.error('Not Found', 'Invoice record not found.');
      }
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  React.useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, fetchInvoice]);

  const handlePrint = () => {
    window.open(`/api/invoices/${invoiceId}/pdf?print=true`, '_blank');
  };

  const handleDownloadPDF = () => {
    window.open(`/api/invoices/${invoiceId}/pdf?download=true`, '_blank');
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) return;

    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' });
      if (res.ok) {
        toastCtx.success('Invoice Deleted', `Invoice ${invoice.invoiceNumber} has been deleted.`);
        router.push('/invoices');
      }
    } catch (err) {
      console.error('Delete invoice failed:', err);
    }
  };

  if (isLoading || !invoice) {
    return (
      <ContentContainer>
        <div className="py-12 text-center text-muted-foreground text-xs">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
          Loading invoice details...
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description={`Manage and review billing details for ${invoice.customer?.companyName || invoice.customer?.name}`}
        breadcrumbs={[{ label: 'Invoices', href: '/invoices' }, { label: invoice.invoiceNumber }]}
        actions={
          <div className="flex items-center space-x-2">
            <Link href="/invoices">
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>
            </Link>

            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="h-9 px-3 text-xs gap-1.5 border-primary/30 text-primary">
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 px-3 text-xs gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              <span>Print Document</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEmailModalOpen(true)}
              className="h-9 px-3 text-xs gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email Invoice</span>
            </Button>

            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
              <Button
                size="sm"
                onClick={() => setIsPaymentModalOpen(true)}
                className="h-9 px-3.5 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <DollarSign className="h-4 w-4" />
                <span>Record Payment</span>
              </Button>
            )}

            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-9 px-2 text-xs text-rose-500 hover:text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="space-y-6 mt-4">
        {/* Printable Area: Invoice Preview Card */}
        <InvoicePreviewCard invoice={invoice} />

        {/* Payment History Table */}
        <Card className="shadow-2xs border-border max-w-3xl mx-auto">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Manual Payment Audit Records</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Complete history of recorded client payments and receipts for this invoice.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {!invoice.payments || invoice.payments.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground text-xs">
                No payments recorded yet for this invoice.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-4">Payment Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Reference #</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                    <th className="py-2.5 px-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invoice.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="py-2.5 px-4 font-mono font-semibold text-foreground">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">{p.paymentMethod}</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{p.referenceNumber || '-'}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{p.recordedByName || 'System'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">
                        ${p.amount.toFixed(2)}
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
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        remainingBalance={invoice.remainingBalance}
        onPaymentRecorded={fetchInvoice}
      />

      {/* Email Modal */}
      <EmailInvoiceModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        customerEmail={invoice.customer?.email}
        customerName={invoice.customer?.name}
        onEmailSent={fetchInvoice}
      />
    </ContentContainer>
  );
}
