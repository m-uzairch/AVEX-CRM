'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientQuotation } from '@/features/portal/types/portal-types';
import { fetchClientQuotationById } from '@/features/portal/services/portal-service';
import {
  ArrowLeft,
  Download,
  Printer,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function ClientQuotationDetailPage() {
  const params = useParams();
  const quotationId = params.id as string;

  const [quotation, setQuotation] = React.useState<ClientQuotation | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (quotationId) {
      setLoading(true);
      setError(null);
      fetchClientQuotationById(quotationId)
        .then(setQuotation)
        .catch((err) => {
          console.error(err);
          setError(err?.message || 'Failed to load quotation.');
        })
        .finally(() => setLoading(false));
    }
  }, [quotationId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.open(`/api/portal/quotations/${quotationId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="font-medium">Loading official quotation proposal...</span>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Quotation Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error || 'The requested quotation could not be found or you do not have permission to view it.'}
        </p>
        <div className="pt-2">
          <Link href="/portal/quotations">
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Quotations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const quoteDate = quotation.quoteDate || quotation.issueDate || quotation.validUntil;
  const expiryDate = quotation.expiryDate || quotation.validUntil;
  const items = quotation.items || [];
  const company = quotation.company;
  const customer = quotation.customer;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Link href="/portal" className="hover:text-foreground transition-colors">
            Portal
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/portal/quotations" className="hover:text-foreground transition-colors">
            Quotations
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">
            {quotation.quotationNumber}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/portal/quotations">
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

      {/* Main Quotation Document Paper Card */}
      <Card className="bg-card border border-border shadow-md rounded-2xl overflow-hidden print:shadow-none print:border-none">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 bg-muted/30 border-b border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                  {quotation.quotationNumber}
                </span>
                {quotation.status === 'ACCEPTED' ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Accepted Proposal
                  </Badge>
                ) : quotation.status === 'REJECTED' ? (
                  <Badge variant="destructive" className="text-xs font-bold gap-1">
                    <XCircle className="h-3 w-3" /> Rejected
                  </Badge>
                ) : quotation.status === 'EXPIRED' ? (
                  <Badge variant="outline" className="text-muted-foreground text-xs font-bold gap-1">
                    <Clock className="h-3 w-3" /> Expired
                  </Badge>
                ) : (
                  <Badge className="bg-primary text-primary-foreground text-xs font-bold gap-1 animate-pulse">
                    <Sparkles className="h-3 w-3" /> Formal Estimate
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground pt-1">
                {quotation.title}
              </h1>
            </div>

            {/* Dates Strip */}
            <div className="flex flex-col sm:items-end text-xs text-muted-foreground space-y-1">
              <div>
                Quote Date: <strong className="text-foreground">{quoteDate ? new Date(quoteDate).toLocaleDateString() : 'N/A'}</strong>
              </div>
              <div>
                Valid Until: <strong className="text-foreground">{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</strong>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Company and Customer Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* From Company */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Prepared By:
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
                <User className="h-3.5 w-3.5 text-primary" /> Prepared For:
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
              <FileCheck className="h-4 w-4 text-primary" /> Scope of Work & Deliverables
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
                        No specific line items detailed in this quote.
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
              {quotation.notes && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    Project Notes & Scope:
                  </span>
                  <p className="text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border leading-relaxed">
                    {quotation.notes}
                  </p>
                </div>
              )}

              {quotation.termsConditions && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Terms & Conditions:
                  </span>
                  <p className="text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border text-[11px] leading-relaxed whitespace-pre-line">
                    {quotation.termsConditions}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Summary Card */}
            <div className="w-full sm:w-80 p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs shrink-0 self-end">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono text-foreground">${quotation.subtotal.toLocaleString()}</span>
              </div>
              {quotation.discountAmount ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount:</span>
                  <span className="font-mono text-emerald-600">-${quotation.discountAmount.toLocaleString()}</span>
                </div>
              ) : null}
              {quotation.taxAmount ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax:</span>
                  <span className="font-mono text-foreground">${quotation.taxAmount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
                <span>Estimated Total:</span>
                <span className="text-primary font-mono">
                  ${quotation.totalAmount.toLocaleString()} {quotation.currency}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
