/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecurringInvoice } from '../types/recurring-invoice-types';
import { Repeat, ArrowUpRight, History, CheckCircle2, PauseCircle, XCircle, AlertCircle } from 'lucide-react';

interface RecurringDetailsModalProps {
  schedule: RecurringInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecurringDetailsModal({ schedule, isOpen, onClose }: RecurringDetailsModalProps) {
  if (!schedule) return null;

  const getStatusBadge = (status: string) => {
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

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="flex items-center justify-between pr-4 mb-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Repeat className="h-4 w-4 text-primary" />
          {schedule.templateName}
        </h2>
        {getStatusBadge(schedule.status)}
      </div>

      <div className="space-y-4 text-xs">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
          <div>
            <span className="text-muted-foreground block text-[10px]">CUSTOMER</span>
            <span className="font-semibold text-foreground">{schedule.customer?.name || 'N/A'}</span>
            <span className="block text-[10px] text-muted-foreground">{schedule.customer?.companyName}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">FREQUENCY</span>
            <span className="font-semibold text-foreground">{schedule.frequency}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">NEXT BILLING DATE</span>
            <span className="font-semibold text-primary">{new Date(schedule.nextBillingDate).toLocaleDateString()}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">CYCLE REVENUE</span>
            <span className="font-bold text-foreground font-mono text-sm">${schedule.grandTotal.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Additional details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] px-1">
          <div>
            <span className="text-muted-foreground">Start Date:</span>{' '}
            <span className="font-medium">{new Date(schedule.billingStartDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Last Invoice:</span>{' '}
            <span className="font-medium">
              {schedule.lastInvoiceDate ? new Date(schedule.lastInvoiceDate).toLocaleDateString() : 'None Yet'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Remaining Cycles:</span>{' '}
            <span className="font-medium">{schedule.remainingCycles ?? 'Ongoing (∞)'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Project:</span>{' '}
            <span className="font-medium">{schedule.project?.name || 'None'}</span>
          </div>
        </div>

        {schedule.status === 'CANCELLED' && schedule.cancellationReason && (
          <div className="bg-rose-500/10 text-rose-700 dark:text-rose-300 p-2.5 rounded text-xs border border-rose-500/20">
            <strong>Cancellation Reason:</strong> {schedule.cancellationReason}
          </div>
        )}

        {/* Items */}
        <div className="border border-border/50 rounded-lg p-3 space-y-2">
          <h4 className="font-semibold text-xs text-foreground">Schedule Line Items</h4>
          <div className="space-y-1.5">
            {(schedule.items || []).map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-card p-2 rounded border border-border/40 text-xs">
                <div>
                  <span className="font-medium text-foreground">{item.name}</span>
                  {item.description && <span className="block text-[10px] text-muted-foreground">{item.description}</span>}
                </div>
                <div className="text-right font-mono">
                  {item.quantity} x ${item.unitPrice.toFixed(2)} = <span className="font-bold">${item.lineTotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generated History Table */}
        <div className="border border-border/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-primary" /> Generated Invoice History
            </h4>
            <span className="text-[10px] text-muted-foreground">Total Generated: {(schedule.history || []).length}</span>
          </div>

          {(!schedule.history || schedule.history.length === 0) ? (
            <div className="text-center py-4 text-muted-foreground text-xs">
              No invoices generated yet for this recurring schedule.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase">
                  <tr>
                    <th className="p-2">Invoice Number</th>
                    <th className="p-2">Generated Date</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {schedule.history.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/20">
                      <td className="p-2 font-mono font-medium text-foreground">{h.invoiceNumber}</td>
                      <td className="p-2">{new Date(h.generatedAt).toLocaleDateString()}</td>
                      <td className="p-2 font-mono font-semibold">${h.amount.toFixed(2)}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {h.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <Link href={`/invoices`}>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 gap-1 text-primary">
                            <span>View Invoice</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
