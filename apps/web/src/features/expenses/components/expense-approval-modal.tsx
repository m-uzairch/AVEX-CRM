/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ExpenseRecord } from '../types/expense-types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Loader2, ExternalLink, Paperclip } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface ExpenseApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseRecord;
  onReviewed: () => void;
}

export function ExpenseApprovalModal({
  isOpen,
  onClose,
  expense,
  onReviewed,
}: ExpenseApprovalModalProps) {
  const toastCtx = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [approvalNotes, setApprovalNotes] = React.useState('');

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/expenses/${expense.id}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvalNotes }),
      });

      if (res.ok) {
        toastCtx.success(
          `Expense ${status}`,
          `Expense "${expense.title}" has been marked as ${status.toLowerCase()}.`
        );
        onReviewed();
        onClose();
      } else {
        const err = await res.json();
        toastCtx.error('Approval Error', err.error || 'Failed to update approval status.');
      }
    } catch (err) {
      console.error('Expense approval error:', err);
      toastCtx.error('Approval Error', 'Failed to process approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Expense Claim - ${expense.title}`}
      description={`Submitted by ${expense.createdByName || expense.employee?.fullName || 'Employee'} for $${expense.amount.toFixed(2)}.`}
    >
      <div className="space-y-4 py-2 text-xs">
        {/* Claim Details Card */}
        <div className="bg-muted/30 p-3.5 rounded-xl border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-sm">{expense.title}</span>
            <span className="font-mono font-extrabold text-sm text-primary">
              ${expense.amount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
            <div>Category: <span className="font-semibold text-foreground">{expense.category?.name || 'N/A'}</span></div>
            <div>Expense Date: <span className="font-semibold text-foreground">{new Date(expense.expenseDate).toLocaleDateString()}</span></div>
            {expense.vendor && <div>Vendor: <span className="font-semibold text-foreground">{expense.vendor.name}</span></div>}
            {expense.project && <div>Project: <span className="font-semibold text-foreground">{expense.project.projectCode}</span></div>}
          </div>

          {expense.description && (
            <p className="text-[11px] text-slate-700 dark:text-slate-300 border-t border-border/60 pt-2 mt-2">
              {expense.description}
            </p>
          )}

          {expense.receiptUrl && (
            <div className="border-t border-border/60 pt-2 flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold text-primary">
                <Paperclip className="h-3.5 w-3.5" />
                {expense.receiptName || 'Receipt Attachment'}
              </span>
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>View Receipt</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Manager Review Notes */}
        <div>
          <label className="font-semibold text-foreground block mb-1">Review Notes / Justification</label>
          <Textarea
            rows={3}
            placeholder="Add approval comments or rejection reason for the employee..."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            className="text-xs bg-background"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8.5 text-xs">
            Cancel
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAction('REJECTED')}
              disabled={isSubmitting}
              className="h-8.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-bold gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Reject Claim</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => handleAction('APPROVED')}
              disabled={isSubmitting}
              className="h-8.5 text-xs bg-emerald-600 text-white font-bold hover:bg-emerald-700 gap-1"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              <span>Approve Expense</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
