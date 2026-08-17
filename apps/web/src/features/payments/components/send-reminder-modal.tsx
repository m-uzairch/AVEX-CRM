/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  remainingBalance: number;
  onSent?: () => void;
}

export function SendReminderModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  customerName,
  remainingBalance,
  onSent,
}: SendReminderModalProps) {
  const toastCtx = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reminderType, setReminderType] = React.useState<'DUE_SOON' | 'OVERDUE' | 'MANUAL'>('MANUAL');

  const handleSend = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, reminderType }),
      });

      if (res.ok) {
        toastCtx.success('Reminder Sent', `Payment reminder sent to ${customerName} for ${invoiceNumber}.`);
        if (onSent) onSent();
        onClose();
      } else {
        const err = await res.json();
        toastCtx.error('Reminder Error', err.error || 'Failed to send reminder.');
      }
    } catch (err) {
      console.error('Send reminder failed:', err);
      toastCtx.error('Send Error', 'Failed to send reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Send Payment Reminder - ${invoiceNumber}`}
      description={`Send email reminder notification for outstanding balance of $${remainingBalance.toFixed(2)} to ${customerName}.`}
    >
      <div className="space-y-4 py-2 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1.5">Reminder Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'MANUAL', label: 'Standard Reminder', desc: 'General payment notification' },
              { id: 'DUE_SOON', label: 'Due Soon', desc: 'Upcoming due date alert' },
              { id: 'OVERDUE', label: 'Urgent Overdue', desc: 'Overdue balance notice' },
            ].map((t) => (
              <div
                key={t.id}
                onClick={() => setReminderType(t.id as any)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  reminderType === t.id
                    ? 'border-primary bg-primary/5 text-primary font-bold'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                }`}
              >
                <div className="text-xs font-bold text-foreground">{t.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8.5 text-xs">
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={isSubmitting}
          className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold"
        >
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          <span>Send Reminder Now</span>
        </Button>
      </div>
    </Dialog>
  );
}
