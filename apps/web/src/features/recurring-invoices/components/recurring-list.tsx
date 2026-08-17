/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RecurringInvoice,
  BillingFrequency,
  RecurringStatus,
} from '../types/recurring-invoice-types';
import {
  Search,
  PauseCircle,
  PlayCircle,
  XCircle,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface RecurringListProps {
  schedules: RecurringInvoice[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectSchedule: (schedule: RecurringInvoice) => void;
}

export function RecurringList({
  schedules,
  isLoading,
  onRefresh,
  onSelectSchedule,
}: RecurringListProps) {
  const toastCtx = useToast();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<RecurringStatus | 'ALL'>('ALL');
  const [frequencyFilter, setFrequencyFilter] = React.useState<BillingFrequency | 'ALL'>('ALL');
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // Filtered schedules
  const filtered = React.useMemo(() => {
    return schedules.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (frequencyFilter !== 'ALL' && s.frequency !== frequencyFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.templateName.toLowerCase().includes(q) ||
          (s.customer?.name && s.customer.name.toLowerCase().includes(q)) ||
          (s.customer?.companyName && s.customer.companyName.toLowerCase().includes(q)) ||
          (s.project?.name && s.project.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [schedules, statusFilter, frequencyFilter, search]);

  const handlePause = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/invoices/recurring/${id}/pause`, { method: 'POST' });
      if (res.ok) {
        toastCtx.success('Billing Paused', 'Schedule has been paused successfully.');
        onRefresh();
      }
    } catch {
      toastCtx.error('Error', 'Failed to pause schedule.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/invoices/recurring/${id}/resume`, { method: 'POST' });
      if (res.ok) {
        toastCtx.success('Billing Resumed', 'Schedule has been resumed successfully.');
        onRefresh();
      }
    } catch {
      toastCtx.error('Error', 'Failed to resume schedule.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = window.prompt('Please enter cancellation reason:', 'Client requested cancellation');
    if (reason === null) return;

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/invoices/recurring/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: reason }),
      });
      if (res.ok) {
        toastCtx.success('Billing Cancelled', 'Schedule cancelled successfully.');
        onRefresh();
      }
    } catch {
      toastCtx.error('Error', 'Failed to cancel schedule.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: RecurringStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" /> ACTIVE</Badge>;
      case 'PAUSED':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] gap-1"><PauseCircle className="h-3 w-3" /> PAUSED</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-[10px] gap-1"><AlertCircle className="h-3 w-3" /> EXPIRED</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] gap-1"><XCircle className="h-3 w-3" /> CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const selectClassName = "flex h-8 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search schedule, customer, project..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as any)}
            className={`${selectClassName} w-36`}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={frequencyFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFrequencyFilter(e.target.value as any)}
            className={`${selectClassName} w-36`}
          >
            <option value="ALL">All Frequencies</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="BI_WEEKLY">Bi-Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="SEMI_ANNUALLY">Semi-Annually</option>
            <option value="YEARLY">Yearly</option>
          </select>

          <Button variant="ghost" size="icon" onClick={onRefresh} className="h-8 w-8">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
            Loading recurring billing schedules...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            No recurring billing schedules found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="p-3">Schedule Name</th>
                  <th className="p-3">Customer & Project</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Next Billing Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelectSchedule(s)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-semibold text-foreground block">{s.templateName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Started: {new Date(s.billingStartDate).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-medium text-foreground block">{s.customer?.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {s.customer?.companyName} {s.project ? `• ${s.project.name}` : ''}
                      </span>
                    </td>

                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {s.frequency}
                      </Badge>
                    </td>

                    <td className="p-3 font-medium text-primary">
                      {new Date(s.nextBillingDate).toLocaleDateString()}
                    </td>

                    <td className="p-3 font-mono font-bold text-foreground">
                      ${s.grandTotal.toFixed(2)} USD
                    </td>

                    <td className="p-3">{getStatusBadge(s.status)}</td>

                    <td className="p-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSchedule(s);
                        }}
                        className="h-7 w-7"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>

                      {s.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionLoadingId === s.id}
                          onClick={(e) => handlePause(s.id, e)}
                          className="h-7 w-7 text-amber-600 hover:text-amber-700"
                          title="Pause Billing"
                        >
                          <PauseCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {s.status === 'PAUSED' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionLoadingId === s.id}
                          onClick={(e) => handleResume(s.id, e)}
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700"
                          title="Resume Billing"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {(s.status === 'ACTIVE' || s.status === 'PAUSED') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionLoadingId === s.id}
                          onClick={(e) => handleCancel(s.id, e)}
                          className="h-7 w-7 text-rose-600 hover:text-rose-700"
                          title="Cancel Billing Schedule"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
