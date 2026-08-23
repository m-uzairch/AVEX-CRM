'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClientInvoice } from '@/features/portal/types/portal-types';
import { fetchClientInvoices } from '@/features/portal/services/portal-service';
import {
  FileText,
  Loader2,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = React.useState<ClientInvoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  React.useEffect(() => {
    setLoading(true);
    fetchClientInvoices()
      .then((res) => {
        setInvoices(res.invoices || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load invoices. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string, paymentStatusSummary?: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1">
            <CheckCircle2 className="h-3 w-3" /> Paid in Full
          </Badge>
        );
      case 'OVERDUE':
        return (
          <Badge variant="destructive" className="text-xs font-bold gap-1 animate-pulse">
            <AlertCircle className="h-3 w-3" /> Overdue
          </Badge>
        );
      case 'PARTIALLY_PAID':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold gap-1">
            <Clock className="h-3 w-3" /> Partially Paid
          </Badge>
        );
      default:
        if (paymentStatusSummary && paymentStatusSummary.includes('Overdue')) {
          return (
            <Badge variant="destructive" className="text-xs font-bold gap-1 animate-pulse">
              <AlertCircle className="h-3 w-3" /> Overdue
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-xs font-bold gap-1">
            <Clock className="h-3 w-3" /> {status}
          </Badge>
        );
    }
  };

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + (inv.balanceDue ?? (inv.totalAmount - inv.amountPaid)), 0);

  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const filtered = invoices.filter((inv) => {
    if (statusFilter === 'UNPAID') {
      if (inv.status === 'PAID' || inv.status === 'CANCELLED') return false;
    } else if (statusFilter === 'PAID') {
      if (inv.status !== 'PAID') return false;
    } else if (statusFilter === 'OVERDUE') {
      const isOverdue = inv.status === 'OVERDUE' || (inv.paymentStatusSummary && inv.paymentStatusSummary.includes('Overdue'));
      if (!isOverdue) return false;
    } else if (statusFilter !== 'ALL' && inv.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(query);
      const matchTitle = inv.title ? inv.title.toLowerCase().includes(query) : false;
      const matchProject = inv.project ? inv.project.name.toLowerCase().includes(query) : false;
      if (!matchNum && !matchTitle && !matchProject) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoices & Statements</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Access issued tax invoices, payment histories, due balances, and official receipts.
          </p>
        </div>

        {/* Financial KPI Summary Strip */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-3 rounded-xl bg-card border border-border shadow-2xs text-xs">
            <span className="text-muted-foreground block text-[10px]">Total Billed</span>
            <span className="font-bold text-foreground text-sm">${totalBilled.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border shadow-2xs text-xs">
            <span className="text-muted-foreground block text-[10px]">Total Paid</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              ${totalPaid.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border shadow-2xs text-xs">
            <span className="text-muted-foreground block text-[10px]">Outstanding Balance</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
              ${totalOutstanding.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 p-1 bg-muted/60 rounded-xl border border-border/80 overflow-x-auto max-w-full">
          {(['ALL', 'UNPAID', 'OVERDUE', 'PAID'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setStatusFilter(filterKey)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === filterKey
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filterKey === 'ALL'
                ? `All Invoices (${invoices.length})`
                : filterKey === 'UNPAID'
                ? `Due / Unpaid (${invoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED').length})`
                : filterKey === 'OVERDUE'
                ? `Overdue (${invoices.filter((i) => i.status === 'OVERDUE' || (i.paymentStatusSummary && i.paymentStatusSummary.includes('Overdue'))).length})`
                : `Paid in Full (${invoices.filter((i) => i.status === 'PAID').length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading invoices...</span>
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-xs text-destructive max-w-md mx-auto space-y-2">
          <AlertCircle className="h-6 w-6 mx-auto" />
          <p className="font-semibold text-sm">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground border-dashed space-y-2">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-1 opacity-50" />
          <p className="text-sm font-semibold text-foreground">No Invoices Found</p>
          <p>
            {searchQuery || statusFilter !== 'ALL'
              ? 'No invoice records match your search or filter criteria.'
              : 'There are no invoices currently recorded under your account.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="mt-2 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inv) => {
            const isUnpaid = inv.status !== 'PAID' && inv.status !== 'CANCELLED';
            const isOverdue = inv.status === 'OVERDUE' || (inv.paymentStatusSummary && inv.paymentStatusSummary.includes('Overdue'));

            return (
              <Card
                key={inv.id}
                className={`hover:border-primary/50 transition-all duration-200 shadow-2xs flex flex-col justify-between ${
                  isOverdue
                    ? 'border-rose-500/40 bg-rose-500/2'
                    : isUnpaid
                    ? 'border-border/80'
                    : 'bg-card'
                }`}
              >
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                      {inv.invoiceNumber}
                    </span>
                    {getStatusBadge(inv.status, inv.paymentStatusSummary)}
                  </div>
                  <CardTitle className="text-base font-bold truncate text-foreground">
                    {inv.title || `Invoice ${inv.invoiceNumber}`}
                  </CardTitle>
                  {inv.project && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <FolderKanban className="h-3.5 w-3.5 text-primary" />
                      {inv.project.name}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Due Date:
                      </span>
                      <span className={`font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'}`}>
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Amount Paid:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ${inv.amountPaid.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-extrabold text-foreground pt-1.5 border-t border-border">
                      <span>Remaining Balance:</span>
                      <span className={inv.balanceDue > 0 ? (isOverdue ? 'text-rose-600' : 'text-foreground') : 'text-emerald-600'}>
                        ${inv.balanceDue.toLocaleString()} {inv.currency}
                      </span>
                    </div>
                  </div>

                  <Link href={`/portal/invoices/${inv.id}`} className="block w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 group">
                      <span>View Tax Invoice</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
