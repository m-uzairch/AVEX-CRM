'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientInvoice } from '@/features/portal/types/portal-types';
import { fetchClientInvoiceById } from '@/features/portal/services/portal-service';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  User,
  CreditCard,
  ShieldCheck,
  Loader2,
  ChevronRight,
  FolderKanban,
  AlertTriangle,
} from 'lucide-react';

export default function ClientInvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = React.useState<ClientInvoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (invoiceId) {
      setLoading(true);
      setError(null);
      fetchClientInvoiceById(invoiceId)
        .then(setInvoice)
        .catch((err) => {
          console.error(err);
          setError(err?.message || 'Failed to load invoice.');
        })
        .finally(() => setLoading(false));
    }
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.open(`/api/portal/invoices/${invoiceId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="font-medium">Loading official tax invoice statement...</span>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Invoice Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error || 'The requested invoice could not be found or you do not have permission to view it.'}
        </p>
        <div className="pt-2">
          <Link href="/portal/invoices">
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const invoiceDate = invoice.invoiceDate || invoice.issueDate || invoice.dueDate;
  const dueDate = invoice.dueDate;
  const items = invoice.items || [];
  const payments = invoice.payments || [];
  const company = invoice.company;
  const customer = invoice.customer;
  const isPaid = invoice.status === 'PAID' || invoice.balanceDue <= 0;
  const isOverdue = invoice.status === 'OVERDUE' || (invoice.paymentStatusSummary && invoice.paymentStatusSummary.includes('Overdue'));

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Link href="/portal" className="hover:text-foreground transition-colors">
            Portal
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/portal/invoices" className="hover:text-foreground transition-colors">
            Invoices
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">
            {invoice.invoiceNumber}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/portal/invoices">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs gap-1.5">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" onClick={handleDownloadPdf} className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Prominent Payment Status Banner */}
      <Card
        className={`shadow-2xs overflow-hidden border ${
          isPaid
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : isOverdue
            ? 'bg-rose-500/10 border-rose-500/30'
            : 'bg-primary/5 border-primary/20'
        }`}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                isPaid
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : isOverdue
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-primary/15 text-primary'
              }`}
            >
              {isPaid ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : isOverdue ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Payment Status
              </span>
              <p
                className={`text-base font-extrabold ${
                  isPaid
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isOverdue
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-foreground'
                }`}
              >
                {invoice.paymentStatusSummary || (isPaid ? 'Paid in Full' : 'Payment Due')}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-muted-foreground block">Outstanding Balance</span>
            <span
              className={`text-xl font-extrabold font-mono ${
                isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
              }`}
            >
              ${invoice.balanceDue.toLocaleString()} {invoice.currency}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Invoice Document Paper Card */}
      <Card className="bg-card border border-border shadow-md rounded-2xl overflow-hidden print:shadow-none print:border-none">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 bg-muted/30 border-b border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                  {invoice.invoiceNumber}
                </span>
                <Badge
                  variant={isPaid ? 'secondary' : isOverdue ? 'destructive' : 'outline'}
                  className="text-xs font-bold"
                >
                  {invoice.status}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground pt-1">
                {invoice.title || `Tax Invoice ${invoice.invoiceNumber}`}
              </h1>
              {invoice.project && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FolderKanban className="h-3.5 w-3.5 text-primary" />
                  Project: <strong className="text-foreground">{invoice.project.name}</strong> ({invoice.project.projectCode})
                </p>
              )}
            </div>

            {/* Dates Strip */}
            <div className="flex flex-col sm:items-end text-xs text-muted-foreground space-y-1">
              <div>
                Issue Date: <strong className="text-foreground">{invoiceDate ? new Date(invoiceDate).toLocaleDateString() : 'N/A'}</strong>
              </div>
              <div>
                Due Date: <strong className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'}>
                  {dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}
                </strong>
              </div>
              {invoice.paidAt && (
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Paid on: {new Date(invoice.paidAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Company and Customer Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* From Company */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Billed By:
              </span>
              <p className="text-sm font-bold text-foreground">{company?.name || 'AVEX CRM'}</p>
              {company?.address && <p className="text-muted-foreground">{company.address}</p>}
              {(company?.city || company?.state || company?.zip) && (
                <p className="text-muted-foreground">
                  {[company.city, company.state, company.zip].filter(Boolean).join(', ')}
                </p>
              )}
              {company?.country && <p className="text-muted-foreground">{company.country}</p>}
              {company?.email && <p className="text-muted-foreground pt-1">Email: {company.email}</p>}
              {company?.phone && <p className="text-muted-foreground">Phone: {company.phone}</p>}
              {company?.taxNumber && (
                <p className="text-muted-foreground text-[11px] font-mono">Tax ID: {company.taxNumber}</p>
              )}
            </div>

            {/* To Customer */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Billed To:
              </span>
              <p className="text-sm font-bold text-foreground">{customer?.name || 'Valued Customer'}</p>
              {customer?.companyName && (
                <p className="font-semibold text-muted-foreground">{customer.companyName}</p>
              )}
              {customer?.address && <p className="text-muted-foreground">{customer.address}</p>}
              {(customer?.city || customer?.state || customer?.zip) && (
                <p className="text-muted-foreground">
                  {[customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}
                </p>
              )}
              {customer?.country && <p className="text-muted-foreground">{customer.country}</p>}
              {customer?.email && <p className="text-muted-foreground pt-1">Email: {customer.email}</p>}
              {customer?.phone && <p className="text-muted-foreground">Phone: {customer.phone}</p>}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Invoiced Items & Services
            </h3>

            <div className="border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3 pl-4">Item & Description</th>
                    <th className="p-3 text-center w-16">Qty</th>
                    <th className="p-3 text-right w-28">Unit Price</th>
                    <th className="p-3 text-right w-20">Tax / Disc</th>
                    <th className="p-3 pr-4 text-right w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">
                        No individual line items detailed on this invoice.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-muted/10">
                        <td className="p-3 pl-4">
                          <p className="font-bold text-foreground text-xs">{item.name}</p>
                          {item.description && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-right text-muted-foreground font-mono">
                          {item.taxRate ? `+${item.taxRate}%` : item.discountRate ? `-${item.discountRate}%` : '0%'}
                        </td>
                        <td className="p-3 pr-4 text-right font-bold font-mono text-foreground">
                          ${item.lineTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals Calculation Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="space-y-4 max-w-md w-full">
              {invoice.notes && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    Invoice Notes:
                  </span>
                  <p className="text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {invoice.termsConditions && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Payment Terms:
                  </span>
                  <p className="text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border text-[11px] leading-relaxed whitespace-pre-line">
                    {invoice.termsConditions}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Summary Card */}
            <div className="w-full sm:w-80 p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs shrink-0 self-end">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono text-foreground">${invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.discountAmount ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount:</span>
                  <span className="font-mono text-emerald-600">-${invoice.discountAmount.toLocaleString()}</span>
                </div>
              ) : null}
              {invoice.taxAmount ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax:</span>
                  <span className="font-mono text-foreground">${invoice.taxAmount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-extrabold text-foreground pt-1.5 border-t border-border">
                <span>Invoice Total:</span>
                <span className="text-foreground font-mono">
                  ${invoice.totalAmount.toLocaleString()} {invoice.currency}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Amount Paid:</span>
                <span className="font-mono">-${invoice.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-foreground pt-1.5 border-t border-border">
                <span>Balance Due:</span>
                <span className={`font-mono ${isPaid ? 'text-emerald-600' : isOverdue ? 'text-rose-600' : 'text-primary'}`}>
                  ${invoice.balanceDue.toLocaleString()} {invoice.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Section (Client Safe) */}
          {payments.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-emerald-500" /> Recorded Payment Transactions
              </h3>

              <div className="border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3 pl-4">Payment Date</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Reference / Transaction ID</th>
                      <th className="p-3 pr-4 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-muted/10">
                        <td className="p-3 pl-4 font-medium text-foreground">
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">
                            {p.paymentMethod.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {p.referenceNumber || 'N/A'}
                        </td>
                        <td className="p-3 pr-4 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          ${p.amount.toLocaleString()} {invoice.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
