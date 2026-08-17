/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  RecurringInvoiceFormValues,
  BillingFrequency,
  RecurringInvoiceItemInput,
} from '../types/recurring-invoice-types';
import { Plus, Trash2, Loader2, Calendar, Repeat } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface RecurringFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecurringFormModal({ isOpen, onClose, onSuccess }: RecurringFormModalProps) {
  const toastCtx = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);

  // Form state
  const [templateName, setTemplateName] = React.useState('');
  const [customerId, setCustomerId] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [billingStartDate, setBillingStartDate] = React.useState(
    new Date().toISOString().substring(0, 10)
  );
  const [billingEndDate, setBillingEndDate] = React.useState('');
  const [frequency, setFrequency] = React.useState<BillingFrequency>('MONTHLY');
  const [customIntervalDays, setCustomIntervalDays] = React.useState<number>(30);
  const [totalCycles, setTotalCycles] = React.useState<string>('');
  const [currency] = React.useState('USD');
  const [notes, setNotes] = React.useState('');
  const [termsConditions, setTermsConditions] = React.useState('Net 14 days');

  // Items
  const [items, setItems] = React.useState<RecurringInvoiceItemInput[]>([
    {
      name: 'Software Subscription Retainer',
      description: 'Monthly cloud maintenance & SLA support',
      quantity: 1,
      unitPrice: 1200,
      discountRate: 0,
      taxRate: 18,
      lineTotal: 1416,
    },
  ]);

  React.useEffect(() => {
    if (isOpen) {
      // Fetch customers & projects dropdowns
      fetch('/api/crm/customers')
        .then((res) => res.json())
        .then((data) => setCustomers(data.data || []))
        .catch(() => {});

      fetch('/api/projects')
        .then((res) => res.json())
        .then((data) => setProjects(data.data || []))
        .catch(() => {});
    }
  }, [isOpen]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountRate: 0,
        taxRate: 0,
        lineTotal: 0,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof RecurringInvoiceItemInput, val: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: val };

      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const disc = Number(item.discountRate) || 0;
      const tax = Number(item.taxRate) || 0;

      const sub = qty * price;
      const discAmt = (sub * disc) / 100;
      const taxable = sub - discAmt;
      const taxAmt = (taxable * tax) / 100;
      item.lineTotal = Math.round((taxable + taxAmt) * 100) / 100;

      updated[idx] = item;
      return updated;
    });
  };

  const grandTotal = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      toastCtx.error('Validation Error', 'Please provide a template name.');
      return;
    }
    if (!customerId) {
      toastCtx.error('Validation Error', 'Please select a customer.');
      return;
    }
    if (items.length === 0 || !items[0].name) {
      toastCtx.error('Validation Error', 'Please add at least one line item with a name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RecurringInvoiceFormValues = {
        templateName: templateName.trim(),
        customerId,
        projectId: projectId || undefined,
        billingStartDate,
        billingEndDate: billingEndDate || undefined,
        frequency,
        customIntervalDays: frequency === 'CUSTOM' ? Number(customIntervalDays) : undefined,
        totalCycles: totalCycles ? parseInt(totalCycles, 10) : undefined,
        currency,
        notes: notes || undefined,
        termsConditions: termsConditions || undefined,
        items,
      };

      const res = await fetch('/api/invoices/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toastCtx.success('Schedule Created', 'Recurring invoice billing schedule created successfully.');
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        toastCtx.error('Failed to Create', errData.error || 'Check fields and try again.');
      }
    } catch (err: any) {
      toastCtx.error('Network Error', err?.message || 'Failed to submit form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClassName = "flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
        <Repeat className="h-4 w-4 text-primary" />
        Create Recurring Invoice Schedule
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* General Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Schedule / Template Name *</label>
            <Input
              placeholder="e.g. Monthly Maintenance Retainer"
              value={templateName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
              required
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Customer *</label>
            <select
              value={customerId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCustomerId(e.target.value)}
              className={selectClassName}
              required
            >
              <option value="">Select Customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.companyName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Related Project (Optional)</label>
            <select
              value={projectId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjectId(e.target.value)}
              className={selectClassName}
            >
              <option value="">No Project (Standalone)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.projectCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Billing Frequency *</label>
            <select
              value={frequency}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFrequency(e.target.value as BillingFrequency)}
              className={selectClassName}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="BI_WEEKLY">Bi-Weekly (14 Days)</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly (3 Months)</option>
              <option value="SEMI_ANNUALLY">Semi-Annually (6 Months)</option>
              <option value="YEARLY">Yearly</option>
              <option value="CUSTOM">Custom Days Interval</option>
            </select>
          </div>

          {frequency === 'CUSTOM' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Custom Days Interval *</label>
              <Input
                type="number"
                min="1"
                value={customIntervalDays}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomIntervalDays(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Billing Start Date *</label>
            <Input
              type="date"
              value={billingStartDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillingStartDate(e.target.value)}
              required
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Billing End Date (Optional)</label>
            <Input
              type="date"
              value={billingEndDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillingEndDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Total Billing Cycles (Optional)</label>
            <Input
              type="number"
              placeholder="e.g. 12 (leave empty for ongoing)"
              value={totalCycles}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalCycles(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-border/50 rounded-lg p-3 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs text-foreground">Recurring Invoice Items</h4>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs gap-1">
              <Plus className="h-3 w-3" /> Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-card p-2 rounded border border-border/40">
                <div className="col-span-4">
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'name', e.target.value)}
                    className="h-7 text-xs"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'quantity', Number(e.target.value))}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    placeholder="Tax%"
                    min="0"
                    value={item.taxRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, 'taxRate', Number(e.target.value))}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="col-span-2 font-mono font-medium text-right pr-2 text-xs">
                  ${item.lineTotal?.toFixed(2)}
                </div>
                <div className="col-span-1 text-right">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(idx)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border/40 font-semibold text-xs">
            <span className="text-muted-foreground">Estimated Invoice Total per Cycle:</span>
            <span className="text-base text-primary font-mono">${grandTotal.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Notes (Displayed on Invoice)</label>
            <Textarea
              rows={2}
              placeholder="Internal or customer notes..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Terms & Conditions</label>
            <Textarea
              rows={2}
              placeholder="Payment terms..."
              value={termsConditions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTermsConditions(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="h-8 text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs gap-1.5 bg-primary">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Calendar className="h-3.5 w-3.5" />
                Create Schedule
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
