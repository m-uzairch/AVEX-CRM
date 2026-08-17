/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { QuotationFormValues, QuotationItemInput, EstimateType } from '../types/quotation-types';
import { QuotationPreviewCard } from './quotation-preview-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface QuotationBuilderFormProps {
  initialValues?: Partial<QuotationFormValues>;
  quotationId?: string;
  isEditing?: boolean;
}

export function QuotationBuilderForm({ initialValues, quotationId, isEditing }: QuotationBuilderFormProps) {
  const router = useRouter();
  const toastCtx = useToast();

  const [customers, setCustomers] = React.useState<any[]>([]);
  const [leads, setLeads] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [customerId, setCustomerId] = React.useState(initialValues?.customerId || '');
  const [leadId, setLeadId] = React.useState(initialValues?.leadId || '');
  const [estimateType, setEstimateType] = React.useState<EstimateType>(initialValues?.estimateType || 'FIXED_PRICE');
  const [quoteDate, setQuoteDate] = React.useState(
    initialValues?.quoteDate ? new Date(initialValues.quoteDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [expiryDate, setExpiryDate] = React.useState(
    initialValues?.expiryDate
      ? new Date(initialValues.expiryDate).toISOString().split('T')[0]
      : new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [currency] = React.useState(initialValues?.currency || 'USD');
  const [status] = React.useState(initialValues?.status || 'DRAFT');
  const [notes, setNotes] = React.useState(initialValues?.notes || '');
  const [termsConditions, setTermsConditions] = React.useState(
    initialValues?.termsConditions || 'Estimate valid for 14 days. Payment terms: 50% deposit upon acceptance, 50% upon delivery.'
  );
  const [changeNotes, setChangeNotes] = React.useState('');

  // Line Items State
  const [items, setItems] = React.useState<QuotationItemInput[]>(
    initialValues?.items && initialValues.items.length > 0
      ? initialValues.items
      : [
          {
            name: 'Web Application Scope & Architecture',
            description: 'Full stack Next.js dashboard design & database integration',
            quantity: 1,
            unitPrice: 2500,
            discountRate: 0,
            taxRate: 5,
            lineTotal: 2625,
          },
        ]
  );

  // Load Customers and Leads for Dropdown Options
  React.useEffect(() => {
    async function loadData() {
      try {
        const [resCust, resLeads] = await Promise.all([
          fetch('/api/crm/customers'),
          fetch('/api/crm/leads'),
        ]);

        if (resCust.ok) {
          const d = await resCust.json();
          const list = d.customers || d.data || [];
          setCustomers(list);
          if (list.length > 0) {
            setCustomerId((prev) => prev || list[0].id);
          }
        }

        if (resLeads.ok) {
          const d = await resLeads.json();
          setLeads(d.leads || d.data || []);
        }
      } catch (err) {
        console.error('Failed to load customers/leads:', err);
      }
    }
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
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

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItemInput, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate line total live
    const qty = Number(newItems[index].quantity) || 0;
    const price = Number(newItems[index].unitPrice) || 0;
    const dRate = Number(newItems[index].discountRate) || 0;
    const tRate = Number(newItems[index].taxRate) || 0;

    const raw = qty * price;
    const disc = (raw * dRate) / 100;
    const tax = ((raw - disc) * tRate) / 100;
    newItems[index].lineTotal = Math.round((raw - disc + tax) * 100) / 100;

    setItems(newItems);
  };

  // Compute live subtotal & grand total for preview
  const calculateFormTotals = () => {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const dRate = Number(item.discountRate) || 0;
      const tRate = Number(item.taxRate) || 0;

      const raw = qty * price;
      const disc = (raw * dRate) / 100;
      const tax = ((raw - disc) * tRate) / 100;

      subtotal += raw;
      discountAmount += disc;
      taxAmount += tax;
    });

    const grandTotal = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      grandTotal,
    };
  }

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedLead = leads.find((l) => l.id === leadId);

  const previewQuotationData = {
    quoteNumber: isEditing ? (initialValues as any)?.quoteNumber : 'QTN-PREVIEW',
    quoteDate,
    expiryDate,
    estimateType,
    status: status as any,
    currency,
    ...calculateFormTotals(),
    notes,
    termsConditions,
    customer: selectedCustomer
      ? {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          companyName: selectedCustomer.companyName,
          email: selectedCustomer.email,
        }
      : { id: 'demo', name: 'Select Customer', companyName: 'Customer Workspace', email: '' },
    lead: selectedLead
      ? {
          id: selectedLead.id,
          title: selectedLead.title,
          contactName: selectedLead.contactName,
          companyName: selectedLead.companyName,
        }
      : null,
    items,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toastCtx.error('Validation Error', 'Please select a customer.');
      return;
    }
    if (items.some((i) => !i.name)) {
      toastCtx.error('Validation Error', 'All line items must have a name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: QuotationFormValues = {
        customerId,
        leadId: leadId || undefined,
        estimateType,
        quoteDate: new Date(quoteDate).toISOString(),
        expiryDate: new Date(expiryDate).toISOString(),
        currency,
        status: status as any,
        notes,
        termsConditions,
        changeNotes,
        items,
      };

      const url = isEditing ? `/api/quotations/${quotationId}` : '/api/quotations';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toastCtx.success(
          isEditing ? 'Quotation Updated' : 'Quotation Created',
          `Quotation ${data.quotation.quoteNumber} saved successfully.`
        );
        router.push(`/quotations/${data.quotation.id}`);
      } else {
        const err = await res.json();
        toastCtx.error('Error', err.error || 'Failed to save quotation.');
      }
    } catch (err) {
      console.error('Save quotation error:', err);
      toastCtx.error('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-2xs">
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/quotations')}
            className="h-8.5 text-xs gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </Button>
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? 'Edit Quotation Estimate' : 'Create New Quotation'}
          </h2>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
        >
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Save Changes' : 'Save Quotation'}</span>
        </Button>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Builder Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Quotation Metadata
            </h3>

            {/* Customer & Lead Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground block mb-1">Select Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Related CRM Lead (Optional)</label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">None / Direct Quotation</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.contactName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimate Type & Dates */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-foreground block mb-1">Estimate Type</label>
                <select
                  value={estimateType}
                  onChange={(e) => setEstimateType(e.target.value as EstimateType)}
                  className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-semibold"
                >
                  <option value="FIXED_PRICE">Fixed Price</option>
                  <option value="HOURLY">Hourly Rate</option>
                  <option value="MONTHLY">Monthly Retainer</option>
                  <option value="CUSTOM">Custom Scope</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Quote Date</label>
                <Input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className="h-8.5 text-xs bg-background"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Valid Until (Expiry)</label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-8.5 text-xs bg-background font-semibold"
                />
              </div>
            </div>

            {isEditing && (
              <div>
                <label className="font-semibold text-foreground block mb-1">Version Change Notes</label>
                <Input
                  placeholder="e.g. Revised scope & updated hourly rates per client call..."
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  className="h-8.5 text-xs bg-background"
                />
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">Quotation Items & Cost Breakdown</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-7 text-xs px-2.5 gap-1 text-primary hover:bg-primary/5"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-muted/20 border border-border/60 rounded-lg space-y-2 relative">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      placeholder="Item Name (e.g. UI/UX Design)"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="h-8 text-xs font-bold bg-background flex-1"
                    />

                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(idx)}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <Input
                    placeholder="Description / deliverable details..."
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="h-7 text-[11px] bg-background text-muted-foreground"
                  />

                  <div className="grid grid-cols-5 gap-2 pt-1 text-[11px]">
                    <div>
                      <label className="text-muted-foreground block mb-0.5">Qty / Hrs</label>
                      <Input
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="h-7 text-xs bg-background text-right font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-muted-foreground block mb-0.5">Unit Price ($)</label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="h-7 text-xs bg-background text-right font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-muted-foreground block mb-0.5">Disc %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountRate || 0}
                        onChange={(e) => handleItemChange(idx, 'discountRate', e.target.value)}
                        className="h-7 text-xs bg-background text-right font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-muted-foreground block mb-0.5">Tax %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxRate || 0}
                        onChange={(e) => handleItemChange(idx, 'taxRate', e.target.value)}
                        className="h-7 text-xs bg-background text-right font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-muted-foreground block mb-0.5">Total ($)</label>
                      <div className="h-7 rounded-md border border-input bg-muted px-2 flex items-center justify-end font-bold font-mono text-foreground">
                        ${Number(item.lineTotal || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Proposal Notes & Terms
            </h3>

            <div>
              <label className="font-semibold text-foreground block mb-1">Proposal Notes</label>
              <Textarea
                rows={2}
                placeholder="Include custom notes or client project deliverables..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs bg-background"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Terms & Conditions</label>
              <Textarea
                rows={3}
                placeholder="Validity terms, payment milestones, scope inclusions..."
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                className="text-xs bg-background"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Quotation Preview */}
        <div className="lg:col-span-6 sticky top-6 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            Real-Time Live Quotation Preview
          </div>
          <QuotationPreviewCard quotation={previewQuotationData} />
        </div>
      </div>
    </form>
  );
}
