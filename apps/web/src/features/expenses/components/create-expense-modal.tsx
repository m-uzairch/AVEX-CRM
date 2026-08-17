/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { ExpenseCategory, Vendor, PaymentMethod, ExpenseStatus } from '../types/expense-types';
import { useToast } from '@/providers/toast-provider';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  vendors: Vendor[];
  onCreated: () => void;
}

export function CreateExpenseModal({
  isOpen,
  onClose,
  categories,
  vendors,
  onCreated,
}: CreateExpenseModalProps) {
  const toastCtx = useToast();

  const [projects, setProjects] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id || '');
  const [amount, setAmount] = React.useState('');
  const [expenseDate, setExpenseDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [vendorId, setVendorId] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('BANK_TRANSFER');
  const [status, setStatus] = React.useState<ExpenseStatus>('PENDING_APPROVAL');
  const [receiptUrl, setReceiptUrl] = React.useState('');
  const [receiptName, setReceiptName] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Load Projects for dropdown
  React.useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const d = await res.json();
          setProjects(d.projects || d.data || []);
        }
      } catch (err) {
        console.error('Failed to load projects for expense:', err);
      }
    }
    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !amount) {
      toastCtx.error('Validation Error', 'Please fill in title, category, and amount.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toastCtx.error('Validation Error', 'Amount must be greater than $0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        categoryId,
        amount: numAmount,
        expenseDate,
        vendorId: vendorId || undefined,
        projectId: projectId || undefined,
        paymentMethod,
        status,
        receiptUrl: receiptUrl || undefined,
        receiptName: receiptName || (receiptUrl ? 'receipt_attachment.pdf' : undefined),
        notes: notes || undefined,
      };

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toastCtx.success('Expense Recorded', `Expense "${title}" saved successfully.`);
        onCreated();
        onClose();
      } else {
        const err = await res.json();
        toastCtx.error('Create Error', err.error || 'Failed to record expense.');
      }
    } catch (err) {
      console.error('Record expense error:', err);
      toastCtx.error('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Record Company Expense"
      description="Record operational or project expense claim with category, vendor, and receipt attachment."
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
        {/* Title */}
        <div>
          <label className="font-semibold text-foreground block mb-1">Expense Title *</label>
          <Input
            placeholder="e.g. AWS Cloud Infrastructure Monthly Hosting"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8.5 text-xs bg-background font-semibold"
          />
        </div>

        {/* Category & Amount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-semibold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Amount ($) *</label>
            <Input
              type="number"
              min="0.01"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-8.5 text-xs bg-background font-mono font-bold"
            />
          </div>
        </div>

        {/* Date, Payment Method & Initial Status */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Expense Date</label>
            <Input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="h-8.5 text-xs bg-background"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="MOBILE_WALLET">Mobile Wallet</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Claim Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ExpenseStatus)}
              className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="PENDING_APPROVAL">Submit for Approval</option>
              <option value="APPROVED">Auto-Approve</option>
              <option value="DRAFT">Save as Draft</option>
            </select>
          </div>
        </div>

        {/* Vendor & Project Linkers */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Vendor (Optional)</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">None / Direct Expense</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Link to Project (Optional)</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">None / General Overhead</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Receipt Attachment URL */}
        <div>
          <label className="font-semibold text-foreground block mb-1">Receipt File / Document URL</label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="https://storage.avexcrm.io/receipts/rec-9824.pdf"
              value={receiptUrl}
              onChange={(e) => {
                setReceiptUrl(e.target.value);
                if (e.target.value && !receiptName) {
                  setReceiptName('Receipt_Attachment.pdf');
                }
              }}
              className="h-8.5 text-xs bg-background font-mono flex-1"
            />
            <Input
              placeholder="File Name"
              value={receiptName}
              onChange={(e) => setReceiptName(e.target.value)}
              className="h-8.5 text-xs bg-background w-36"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="font-semibold text-foreground block mb-1">Description / Purpose</label>
          <Textarea
            rows={2}
            placeholder="Explain expense details or business justification..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs bg-background"
          />
        </div>

        {/* Internal Notes */}
        <div>
          <label className="font-semibold text-foreground block mb-1">Internal Notes</label>
          <Input
            placeholder="Reference notes or internal audit remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-8.5 text-xs bg-background"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8.5 text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Expense</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
