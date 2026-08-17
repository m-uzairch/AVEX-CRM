/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { QuotationKPISummaryCards } from '@/features/quotations/components/quotation-kpi-summary';
import { QuotationFilterBar } from '@/features/quotations/components/quotation-filter-bar';
import { Quotation, QuotationFilterState, QuotationKPISummary } from '@/features/quotations/types/quotation-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Trash2, Loader2, Edit, FileText, Mail } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';
import { EmailQuotationModal } from '@/features/quotations/components/email-quotation-modal';

export default function QuotationsDashboardPage() {
  const toastCtx = useToast();
  const [quotations, setQuotations] = React.useState<Quotation[]>([]);
  const [selectedQuoteForEmail, setSelectedQuoteForEmail] = React.useState<Quotation | null>(null);
  const [summary, setSummary] = React.useState<QuotationKPISummary>({
    totalQuotesCount: 0,
    totalQuotedValue: 0,
    acceptedValue: 0,
    pendingValue: 0,
    draftCount: 0,
    sentCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    expiredCount: 0,
    convertedCount: 0,
  });

  const [filters, setFilters] = React.useState<QuotationFilterState>({
    search: '',
    status: 'ALL',
    estimateType: 'ALL',
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchQuotations = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.estimateType && filters.estimateType !== 'ALL') params.set('estimateType', filters.estimateType);

      const res = await fetch(`/api/quotations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuotations(data.quotations || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleDelete = async (id: string, quoteNumber: string) => {
    if (!confirm(`Are you sure you want to delete quotation ${quoteNumber}?`)) return;

    try {
      const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toastCtx.success('Quotation Deleted', `Quotation ${quoteNumber} deleted successfully.`);
        fetchQuotations();
      } else {
        toastCtx.error('Delete Failed', 'Failed to delete quotation.');
      }
    } catch (err) {
      console.error('Delete quotation failed:', err);
      toastCtx.error('Delete Error', 'Failed to delete quotation.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">ACCEPTED</Badge>;
      case 'CONVERTED':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-bold">CONVERTED</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-bold">REJECTED</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">EXPIRED</Badge>;
      case 'SENT':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-bold">SENT</Badge>;
      case 'VIEWED':
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px] font-bold">VIEWED</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[10px] font-bold">DRAFT</Badge>;
    }
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Quotation & Estimation System"
        description="Create cost estimates, track client proposals, manage version history, and convert accepted quotes to Projects & Invoices with 1 click."
        breadcrumbs={[{ label: 'Quotations' }]}
        actions={
          <Link href="/quotations/new">
            <Button size="sm" className="h-9 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Plus className="h-4 w-4" />
              <span>Create Quotation</span>
            </Button>
          </Link>
        }
      />

      <div className="space-y-6 text-xs mt-4">
        {/* Summary KPI Cards */}
        <QuotationKPISummaryCards summary={summary} />

        {/* Filter Bar */}
        <QuotationFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({ search: '', status: 'ALL', estimateType: 'ALL' })}
        />

        {/* Quotations List Table */}
        <Card className="shadow-2xs border-border">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>All Quotations & Estimates</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Showing {quotations.length} records in system
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading quotations...
              </div>
            ) : quotations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-3">
                <div>No quotations match your filters.</div>
                <Link href="/quotations/new">
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    Create your first quotation estimate
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Quote Number</th>
                      <th className="py-3 px-4">Customer / Lead</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Quote Date</th>
                      <th className="py-3 px-4">Valid Until</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Grand Total</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {quotations.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          <Link href={`/quotations/${q.id}`} className="hover:underline">
                            {q.quoteNumber}
                          </Link>
                          {q.version > 1 && (
                            <span className="ml-1 text-[10px] text-muted-foreground font-semibold">
                              (v{q.version})
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">
                            {q.customer?.companyName || q.customer?.name || 'Unknown Client'}
                          </div>
                          {q.lead && (
                            <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                              Lead: {q.lead.title}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono uppercase text-[10px] text-muted-foreground font-semibold">
                          {q.estimateType.replace('_', ' ')}
                        </td>

                        <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                          {new Date(q.quoteDate).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                          {new Date(q.expiryDate).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4">{getStatusBadge(q.status)}</td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                          ${q.grandTotal.toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Link href={`/quotations/${q.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View Quote">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedQuoteForEmail(q)}
                              className="h-7 w-7 p-0 text-purple-600 hover:text-purple-700"
                              title="Email Quotation"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </Button>

                            <Link href={`/quotations/${q.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit Quote">
                                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(q.id, q.quoteNumber)}
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                              title="Delete Quote"
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

      {selectedQuoteForEmail && (
        <EmailQuotationModal
          isOpen={!!selectedQuoteForEmail}
          onClose={() => setSelectedQuoteForEmail(null)}
          quotationId={selectedQuoteForEmail.id}
          quoteNumber={selectedQuoteForEmail.quoteNumber}
          customerEmail={selectedQuoteForEmail.customer?.email}
          customerName={selectedQuoteForEmail.customer?.name}
          grandTotal={selectedQuoteForEmail.grandTotal}
          expiryDate={selectedQuoteForEmail.expiryDate}
          onEmailSent={fetchQuotations}
        />
      )}
    </ContentContainer>
  );
}
