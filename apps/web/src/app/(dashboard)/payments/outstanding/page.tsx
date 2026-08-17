/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { OutstandingInvoiceItem } from '@/features/payments/types/payment-types';
import { SendReminderModal } from '@/features/payments/components/send-reminder-modal';
import { RecordPaymentModal } from '@/features/invoices/components/record-payment-modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Mail, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export default function OutstandingInvoicesPage() {
  const [items, setItems] = React.useState<OutstandingInvoiceItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Selected item for modals
  const [selectedInvoice, setSelectedInvoice] = React.useState<OutstandingInvoiceItem | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);

  const fetchOutstanding = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payments/outstanding');
      if (res.ok) {
        const data = await res.json();
        setItems(data.outstandingInvoices || []);
      }
    } catch (err) {
      console.error('Failed to fetch outstanding invoices:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOutstanding();
  }, [fetchOutstanding]);

  return (
    <ContentContainer>
      <PageHeader
        title="Outstanding Invoices & Aging Analysis"
        description="Monitor active open balances, overdue days aging, collection progress, and trigger payment reminders."
        breadcrumbs={[{ label: 'Payments', href: '/payments' }, { label: 'Outstanding Invoices' }]}
        actions={
          <Link href="/payments">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Payment History</span>
            </Button>
          </Link>
        }
      />

      <div className="mt-4 space-y-6 text-xs">
        <Card className="shadow-2xs border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Receivables Aging Schedule</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {items.length} outstanding invoices requiring payment collection
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading outstanding invoices aging schedule...
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No outstanding or overdue invoices! All client accounts are fully paid up.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Aging Status</th>
                      <th className="py-3 px-4">Collection Progress</th>
                      <th className="py-3 px-4 text-right">Invoice Total</th>
                      <th className="py-3 px-4 text-right">Balance Due</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          <Link href={`/invoices/${item.id}`} className="hover:underline">
                            {item.invoiceNumber}
                          </Link>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{item.customerCompanyName}</div>
                          <div className="text-[10px] text-muted-foreground">{item.customerName}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4">
                          {item.isOverdue ? (
                            <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold text-[10px] gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {Math.abs(item.daysRemainingOrOverdue)} Days Overdue
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] gap-1">
                              <Clock className="h-3 w-3" />
                              {item.daysRemainingOrOverdue} Days Left
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1 w-32">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span>${item.amountPaid.toFixed(0)} paid</span>
                              <span>{item.percentagePaid}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${item.percentagePaid}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                          ${item.grandTotal.toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-extrabold text-rose-600 dark:text-rose-400">
                          ${item.remainingBalance.toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(item);
                                setIsReminderModalOpen(true);
                              }}
                              className="h-7 text-[11px] gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                              title="Send Payment Reminder"
                            >
                              <Mail className="h-3 w-3" />
                              <span>Reminder</span>
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(item);
                                setIsPaymentModalOpen(true);
                              }}
                              className="h-7 text-[11px] gap-1 bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                              title="Record Payment"
                            >
                              <DollarSign className="h-3 w-3" />
                              <span>Pay</span>
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

      {/* Reminder Modal */}
      {selectedInvoice && isReminderModalOpen && (
        <SendReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.invoiceNumber}
          customerName={selectedInvoice.customerCompanyName || selectedInvoice.customerName}
          remainingBalance={selectedInvoice.remainingBalance}
          onSent={fetchOutstanding}
        />
      )}

      {/* Record Payment Modal */}
      {selectedInvoice && isPaymentModalOpen && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.invoiceNumber}
          remainingBalance={selectedInvoice.remainingBalance}
          onPaymentRecorded={fetchOutstanding}
        />
      )}
    </ContentContainer>
  );
}
