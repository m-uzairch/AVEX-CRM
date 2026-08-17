/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceFormValues, InvoiceItemInput, InvoiceStatus } from '../types/invoice-types';
import { InvoicePreviewCard } from './invoice-preview-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface InvoiceBuilderFormProps {
  initialValues?: Partial<InvoiceFormValues>;
  invoiceId?: string;
}

export function InvoiceBuilderForm({ initialValues, invoiceId }: InvoiceBuilderFormProps) {
  const router = useRouter();
  const toastCtx = useToast();

  const isEditing = !!invoiceId;

  // Form State
  const [customerId, setCustomerId] = React.useState(initialValues?.customerId || '');
  const [projectId, setProjectId] = React.useState(initialValues?.projectId || '');
  const [salesRepId] = React.useState(initialValues?.salesRepId || '');
  const [invoiceDate, setInvoiceDate] = React.useState(
    initialValues?.invoiceDate ? initialValues.invoiceDate.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = React.useState(
    initialValues?.dueDate
      ? initialValues.dueDate.split('T')[0]
      : new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = React.useState<InvoiceStatus>(initialValues?.status || 'DRAFT');
  const [currency, setCurrency] = React.useState(initialValues?.currency || 'USD');
  const [notes, setNotes] = React.useState(
    initialValues?.notes || 'Thank you for your business! Please remit payment by the due date.'
  );
  const [termsConditions, setTermsConditions] = React.useState(
    initialValues?.termsConditions || 'Payment is due within 14 days of invoice date. Late payments subject to a 1.5% monthly fee.'
  );

  // Line items state
  const [items, setItems] = React.useState<InvoiceItemInput[]>(
    initialValues?.items && initialValues.items.length > 0
      ? initialValues.items
      : [
          {
            name: 'Web Design & Development',
            description: 'Custom frontend implementation and CRM UI design',
            quantity: 1,
            unitPrice: 2500,
            discountRate: 0,
            taxRate: 5,
            lineTotal: 2625,
          },
        ]
  );

  // Dropdown Options state
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    // Fetch customers list for dropdown
    fetch('/api/crm/customers')
      .then((res) => res.json())
      .then((data) => {
        const list = data.customers || data.data || [];
        setCustomers(list);
        if (!customerId && list.length > 0) {
          setCustomerId(list[0].id);
        }
      })
      .catch(() => {});

    // Fetch projects list for dropdown
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || data.data || []);
      })
      .catch(() => {});
  }, [customerId]);

  // Handle item change
  const handleItemChange = (index: number, field: keyof InvoiceItemInput, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const updatedItem = { ...copy[index], [field]: value };

      const qty = Number(updatedItem.quantity) || 0;
      const price = Number(updatedItem.unitPrice) || 0;
      const rawTotal = qty * price;
      const dRate = Number(updatedItem.discountRate) || 0;
      const discountVal = (rawTotal * dRate) / 100;
      const tRate = Number(updatedItem.taxRate) || 0;
      const taxVal = ((rawTotal - discountVal) * tRate) / 100;

      updatedItem.lineTotal = Math.round((rawTotal - discountVal + taxVal) * 100) / 100;

      copy[index] = updatedItem;
      return copy;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: 'New Service Item',
        description: '',
        quantity: 1,
        unitPrice: 100,
        discountRate: 0,
        taxRate: 0,
        lineTotal: 100,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute live subtotal, discount, tax, grand total for preview
  const previewTotals = React.useMemo(() => {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const rawTotal = qty * price;
      const dRate = Number(item.discountRate) || 0;
      const itemDiscount = (rawTotal * dRate) / 100;
      const tRate = Number(item.taxRate) || 0;
      const itemTax = ((rawTotal - itemDiscount) * tRate) / 100;

      subtotal += rawTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
    });

    const grandTotal = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      grandTotal,
    };
  }, [items]);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedProject = projects.find((p) => p.id === projectId);

  const previewInvoiceData = {
    invoiceNumber: isEditing ? (initialValues as any)?.invoiceNumber : 'INV-PREVIEW',
    invoiceDate,
    dueDate,
    status,
    currency,
    subtotal: previewTotals.subtotal,
    discountAmount: previewTotals.discountAmount,
    taxAmount: previewTotals.taxAmount,
    grandTotal: previewTotals.grandTotal,
    remainingBalance: previewTotals.grandTotal,
    notes,
    termsConditions,
    customer: selectedCustomer
      ? {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          companyName: selectedCustomer.companyName || selectedCustomer.name,
          email: selectedCustomer.email,
          address: selectedCustomer.address,
          city: selectedCustomer.city,
        }
      : undefined,
    project: selectedProject
      ? { id: selectedProject.id, projectCode: selectedProject.projectCode, name: selectedProject.name }
      : null,
    items,
  };

  const handleSubmit = async (targetStatus: InvoiceStatus = status) => {
    if (!customerId) {
      toastCtx.error('Validation Error', 'Please select a customer for this invoice.');
      return;
    }

    if (items.length === 0) {
      toastCtx.error('Validation Error', 'Please add at least one line item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: InvoiceFormValues = {
        customerId,
        projectId: projectId || undefined,
        salesRepId: salesRepId || undefined,
        invoiceDate,
        dueDate,
        currency,
        status: targetStatus,
        notes,
        termsConditions,
        items,
      };

      const url = isEditing ? `/api/invoices/${invoiceId}` : '/api/invoices';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toastCtx.success(
          isEditing ? 'Invoice Updated' : 'Invoice Created',
          `Invoice ${data.invoice?.invoiceNumber || ''} saved successfully.`
        );
        router.push(`/invoices/${data.invoice?.id || invoiceId}`);
      } else {
        const errData = await res.json();
        toastCtx.error('Save Failed', errData.error || 'Failed to save invoice.');
      }
    } catch (err: any) {
      console.error('Invoice submit failed:', err);
      toastCtx.error('Save Error', 'Failed to save invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-2xs">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/invoices')} className="h-8.5 text-xs gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </Button>
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            className="h-8.5 text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save as Draft</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleSubmit('SENT')}
            disabled={isSubmitting}
            className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Save & Mark Sent</span>
          </Button>
        </div>
      </div>

      {/* Main Split Grid: Left Form, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Basic Information Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4 text-xs">
            <div className="font-bold text-sm text-foreground border-b border-border/60 pb-2">
              Invoice Header Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground block mb-1">Customer / Client *</label>
                <select
                  value={customerId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCustomerId(e.target.value)}
                  className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName || c.name} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Related Project (Optional)</label>
                <select
                  value={projectId || 'NONE'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjectId(e.target.value === 'NONE' ? '' : e.target.value)}
                  className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="NONE">None (Standalone Invoice)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode}: {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Invoice Date *</label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="h-8.5 text-xs bg-background"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Due Date *</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8.5 text-xs bg-background"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Invoice Status</label>
                <select
                  value={status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as InvoiceStatus)}
                  className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="VIEWED">Viewed</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
                  className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Editor Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="font-bold text-sm text-foreground">Line Items</div>
              <Button variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-[11px] gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-muted/30 border border-border/70 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      placeholder="Item Title / Name (e.g. Website Design)"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="h-8 text-xs bg-background font-semibold flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Textarea
                    rows={1}
                    placeholder="Description / Line Item details (optional)..."
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="text-xs bg-background"
                  />

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-muted-foreground block font-medium">Qty</label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        className="h-7 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block font-medium">Unit Price ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        className="h-7 text-xs bg-background font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block font-medium">Discount %</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={item.discountRate || 0}
                        onChange={(e) => handleItemChange(idx, 'discountRate', Number(e.target.value))}
                        className="h-7 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block font-medium">Tax %</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={item.taxRate || 0}
                        onChange={(e) => handleItemChange(idx, 'taxRate', Number(e.target.value))}
                        className="h-7 text-xs bg-background"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Terms Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4 text-xs">
            <div className="font-bold text-sm text-foreground border-b border-border/60 pb-2">
              Notes & Terms & Conditions
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Notes for Customer</label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs bg-background"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Terms & Conditions</label>
              <Textarea
                rows={2}
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                className="text-xs bg-background"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Invoice Preview */}
        <div className="lg:col-span-5 sticky top-6 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            Real-Time Live Invoice Preview
          </div>
          <InvoicePreviewCard invoice={previewInvoiceData} />
        </div>
      </div>
    </div>
  );
}
