/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  remainingBalance: number;
  onPaymentRecorded: () => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  remainingBalance,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  const toastCtx = useToast();
  const [amount, setAmount] = React.useState(remainingBalance);
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = React.useState('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAmount(remainingBalance);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('BANK_TRANSFER');
      setReferenceNumber('');
      setNotes('');
    }
  }, [isOpen, remainingBalance]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toastCtx.error('Validation Error', 'Payment amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          paymentDate,
          paymentMethod,
          referenceNumber: referenceNumber || undefined,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        toastCtx.success('Payment Recorded', `Recorded payment of $${amount} for ${invoiceNumber}.`);
        onPaymentRecorded();
        onClose();
      } else {
        const errData = await res.json();
        toastCtx.error('Payment Error', errData.error || 'Failed to record payment.');
      }
    } catch (err: any) {
      console.error('Record payment error:', err);
      toastCtx.error('Payment Error', 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-sm text-foreground">Record Payment</h3>
              <p className="text-[11px] text-muted-foreground font-mono">{invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-md p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">Payment Amount ($) *</label>
            <Input
              type="number"
              step="0.01"
              required
              min={0.01}
              max={remainingBalance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-9 text-xs bg-background font-mono font-bold text-emerald-600"
            />
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Outstanding Balance: ${remainingBalance.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Payment Date *</label>
            <Input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="h-8.5 text-xs bg-background"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="BANK_TRANSFER">Bank Transfer (ACH / Wire)</option>
              <option value="CASH">Cash</option>
              <option value="CHECK">Check</option>
              <option value="CREDIT_CARD">Credit Card (Manual Track)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Reference / Transaction #</label>
            <Input
              placeholder="e.g. TR-894028 or Check #1042"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="h-8.5 text-xs bg-background font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Notes (Optional)</label>
            <Textarea
              rows={2}
              placeholder="Add optional notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs bg-background"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>Save Payment</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
