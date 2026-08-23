'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClientQuotation } from '@/features/portal/types/portal-types';
import { fetchClientQuotations } from '@/features/portal/services/portal-service';
import {
  FileCheck,
  Loader2,
  FolderKanban,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function ClientQuotationsPage() {
  const [quotations, setQuotations] = React.useState<ClientQuotation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  React.useEffect(() => {
    setLoading(true);
    fetchClientQuotations()
      .then((res) => {
        setQuotations(res.quotations || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load your quotations. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1">
            <CheckCircle2 className="h-3 w-3" /> Accepted
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="text-xs font-bold gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs font-bold gap-1">
            <Clock className="h-3 w-3" /> Expired
          </Badge>
        );
      case 'SENT':
        return (
          <Badge variant="default" className="bg-primary text-primary-foreground text-xs font-bold gap-1 animate-pulse">
            <Sparkles className="h-3 w-3" /> Ready for Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs font-bold gap-1">
            <Clock className="h-3 w-3" /> {status}
          </Badge>
        );
    }
  };

  const totalQuotes = quotations.length;
  const acceptedQuotes = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const pendingQuotes = quotations.filter((q) => q.status === 'SENT' || q.status === 'DRAFT').length;
  const totalPipeline = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  const filtered = quotations.filter((q) => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchNum = q.quotationNumber.toLowerCase().includes(query);
      const matchTitle = q.title.toLowerCase().includes(query);
      const matchProject = q.project?.name.toLowerCase().includes(query);
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
            <FileCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Quotations & Proposals</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Review formal cost estimates, scopes of work, and project proposals submitted by our team.
          </p>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-3 rounded-xl bg-card border border-border shadow-2xs text-xs">
            <span className="text-muted-foreground block text-[10px]">Total Proposals</span>
            <span className="font-bold text-foreground text-sm">{totalQuotes}</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border shadow-2xs text-xs">
            <span className="text-muted-foreground block text-[10px]">Pending Review</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{pendingQuotes}</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border shadow-2xs text-xs">
            <span className="text-muted-foreground block text-[10px]">Accepted</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{acceptedQuotes}</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border shadow-2xs text-xs">
            <span className="text-muted-foreground block text-[10px]">Total Proposal Value</span>
            <span className="font-bold text-primary text-sm">${totalPipeline.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 p-1 bg-muted/60 rounded-xl border border-border/80 overflow-x-auto max-w-full">
          {(['ALL', 'SENT', 'ACCEPTED', 'EXPIRED', 'REJECTED'] as const).map((filterKey) => (
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
                ? `All (${quotations.length})`
                : filterKey === 'SENT'
                ? `Pending Review (${quotations.filter((q) => q.status === 'SENT' || q.status === 'DRAFT').length})`
                : filterKey === 'ACCEPTED'
                ? `Accepted (${quotations.filter((q) => q.status === 'ACCEPTED').length})`
                : filterKey === 'EXPIRED'
                ? `Expired (${quotations.filter((q) => q.status === 'EXPIRED').length})`
                : `Rejected (${quotations.filter((q) => q.status === 'REJECTED').length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading quotations...</span>
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-xs text-destructive max-w-md mx-auto space-y-2">
          <AlertCircle className="h-6 w-6 mx-auto" />
          <p className="font-semibold text-sm">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground border-dashed space-y-2">
          <FileCheck className="h-8 w-8 text-muted-foreground mx-auto mb-1 opacity-50" />
          <p className="text-sm font-semibold text-foreground">No Quotations Found</p>
          <p>
            {searchQuery || statusFilter !== 'ALL'
              ? 'No quotation matches your search or filter selection.'
              : 'There are no active or past quotations associated with your client account.'}
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
          {filtered.map((q) => {
            const isPending = q.status === 'SENT' || q.status === 'DRAFT';
            const expiryDate = q.expiryDate || q.validUntil;

            return (
              <Card
                key={q.id}
                className={`hover:border-primary/50 transition-all duration-200 shadow-2xs flex flex-col justify-between ${
                  isPending ? 'border-primary/40 bg-primary/2' : ''
                }`}
              >
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                      {q.quotationNumber}
                    </span>
                    {getStatusBadge(q.status)}
                  </div>
                  <CardTitle className="text-base font-bold truncate text-foreground">
                    {q.title}
                  </CardTitle>
                  {q.project && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <FolderKanban className="h-3.5 w-3.5 text-primary" />
                      {q.project.name}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Valid Until:
                      </span>
                      <span className="font-semibold text-foreground">
                        {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Upon agreement'}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Line Items:</span>
                      <span className="font-semibold text-foreground">
                        {q.itemsCount || q.items?.length || 1} item(s)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-foreground pt-1.5 border-t border-border">
                      <span>Total Estimate:</span>
                      <span className="text-primary">
                        ${q.totalAmount.toLocaleString()} {q.currency}
                      </span>
                    </div>
                  </div>

                  <Link href={`/portal/quotations/${q.id}`} className="block w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 group">
                      <span>View Official Quotation</span>
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
