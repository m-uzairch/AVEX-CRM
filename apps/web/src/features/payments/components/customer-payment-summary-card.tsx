/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { CustomerPaymentSummary } from '../types/payment-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface CustomerPaymentSummaryCardProps {
  summary: CustomerPaymentSummary;
}

export function CustomerPaymentSummaryCard({ summary }: CustomerPaymentSummaryCardProps) {
  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span>Customer Financial & Payment Summary</span>
          <Badge variant="outline" className="text-[10px] font-mono">
            {summary.companyName}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-muted/30 p-2.5 rounded-lg border border-border/60">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase">Total Invoiced</div>
            <div className="text-sm font-extrabold text-foreground font-mono mt-0.5">
              ${summary.totalInvoiced.toFixed(2)}
            </div>
          </div>

          <div className="bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20">
            <div className="text-[10px] text-emerald-600 font-semibold uppercase flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Total Paid
            </div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              ${summary.totalPaid.toFixed(2)}
            </div>
          </div>

          <div className="bg-blue-500/5 p-2.5 rounded-lg border border-blue-500/20">
            <div className="text-[10px] text-blue-600 font-semibold uppercase flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Outstanding Balance
            </div>
            <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
              ${summary.outstandingBalance.toFixed(2)}
            </div>
          </div>

          <div className="bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/20">
            <div className="text-[10px] text-rose-600 font-semibold uppercase flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Overdue Amount
            </div>
            <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
              ${summary.overdueAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Recent Payment Activity */}
        <div className="space-y-2 pt-1 border-t border-border/60">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Recent Payment Receipts
          </div>

          {summary.recentPayments.length === 0 ? (
            <div className="text-muted-foreground text-center py-2">No payments recorded for this customer.</div>
          ) : (
            <div className="space-y-1.5">
              {summary.recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-md bg-muted/20 border border-border/40 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-semibold text-primary">{p.invoice?.invoiceNumber}</span>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold">
                      {p.paymentMethod.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      +${p.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
