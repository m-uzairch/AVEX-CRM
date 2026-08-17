'use client';

import * as React from 'react';
import {
  TaxRate,
  TaxRateInput,
  TaxTemplateInput,
  DiscountInput,
  DiscountRuleInput,
  TaxType,
  TaxStatus,
  DiscountType,
  DiscountApplicableTo,
  DiscountRuleStatus,
} from '../types/tax-types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'TAX' | 'TEMPLATE' | 'DISCOUNT' | 'RULE';
  initialData?: any;
  availableTaxes?: TaxRate[];
  onSaveTax?: (data: TaxRateInput) => Promise<void>;
  onSaveTemplate?: (data: TaxTemplateInput) => Promise<void>;
  onSaveDiscount?: (data: DiscountInput) => Promise<void>;
  onSaveRule?: (data: DiscountRuleInput) => Promise<void>;
}

export function TaxModal({
  isOpen,
  onClose,
  mode,
  initialData,
  availableTaxes = [],
  onSaveTax,
  onSaveTemplate,
  onSaveDiscount,
  onSaveRule,
}: TaxModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Tax form state
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [percentage, setPercentage] = React.useState<number | string>(18);
  const [taxType, setTaxType] = React.useState<TaxType>('EXCLUSIVE');
  const [taxStatus, setTaxStatus] = React.useState<TaxStatus>('ACTIVE');
  const [description, setDescription] = React.useState('');

  // Discount form state
  const [discountType, setDiscountType] = React.useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = React.useState<number | string>(10);
  const [applicableTo, setApplicableTo] = React.useState<DiscountApplicableTo>('ALL');

  // Template form state
  const [isDefault, setIsDefault] = React.useState(false);
  const [selectedTaxRateIds, setSelectedTaxRateIds] = React.useState<string[]>([]);

  // Rule form state
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [ruleStatus, setRuleStatus] = React.useState<DiscountRuleStatus>('ACTIVE');

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setDescription(initialData.description || '');
      setPercentage(initialData.percentage ?? 18);
      setTaxType(initialData.type || 'EXCLUSIVE');
      setTaxStatus(initialData.status || 'ACTIVE');

      setDiscountType(initialData.type || 'PERCENTAGE');
      setDiscountValue(initialData.value ?? 10);
      setApplicableTo(initialData.applicableTo || 'ALL');

      setIsDefault(Boolean(initialData.isDefault));
      if (initialData.taxes) {
        setSelectedTaxRateIds(initialData.taxes.map((t: any) => t.id));
      } else {
        setSelectedTaxRateIds([]);
      }

      setStartDate(initialData.startDate ? initialData.startDate.substring(0, 10) : '');
      setEndDate(initialData.endDate ? initialData.endDate.substring(0, 10) : '');
      setRuleStatus(initialData.status || 'ACTIVE');
    } else {
      setName('');
      setCode('');
      setDescription('');
      setPercentage(18);
      setTaxType('EXCLUSIVE');
      setTaxStatus('ACTIVE');
      setDiscountType('PERCENTAGE');
      setDiscountValue(10);
      setApplicableTo('ALL');
      setIsDefault(false);
      setSelectedTaxRateIds([]);
      setStartDate('');
      setEndDate('');
      setRuleStatus('ACTIVE');
    }
    setError(null);
  }, [initialData, isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name field is required.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'TAX') {
        const val = Number(percentage);
        if (isNaN(val) || val < 0 || val > 100) {
          throw new Error('Percentage must be between 0 and 100.');
        }
        await onSaveTax?.({
          name: name.trim(),
          code: code.trim(),
          percentage: val,
          type: taxType,
          status: taxStatus,
          description: description.trim(),
        });
      } else if (mode === 'TEMPLATE') {
        await onSaveTemplate?.({
          name: name.trim(),
          description: description.trim(),
          isDefault,
          calculationMethod: taxType,
          taxRateIds: selectedTaxRateIds,
        });
      } else if (mode === 'DISCOUNT') {
        const val = Number(discountValue);
        if (isNaN(val) || val < 0) {
          throw new Error('Discount value must be a positive number.');
        }
        await onSaveDiscount?.({
          name: name.trim(),
          code: code.trim(),
          type: discountType,
          value: val,
          applicableTo,
          description: description.trim(),
          status: taxStatus,
        });
      } else if (mode === 'RULE') {
        const val = Number(discountValue);
        if (isNaN(val) || val < 0) {
          throw new Error('Discount rule value must be a positive number.');
        }
        await onSaveRule?.({
          name: name.trim(),
          description: description.trim(),
          type: discountType,
          value: val,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: ruleStatus,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const isEdit = Boolean(initialData?.id);
    switch (mode) {
      case 'TAX':
        return isEdit ? 'Edit Tax Rate' : 'Create New Tax Rate';
      case 'TEMPLATE':
        return isEdit ? 'Edit Tax Template' : 'Create Tax Template';
      case 'DISCOUNT':
        return isEdit ? 'Edit Discount' : 'Create New Discount';
      case 'RULE':
        return isEdit ? 'Edit Discount Rule' : 'Create Discount Rule';
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              mode === 'TAX'
                ? 'e.g. Standard GST'
                : mode === 'TEMPLATE'
                ? 'e.g. Pakistan GST Template'
                : mode === 'DISCOUNT'
                ? 'e.g. VIP Customer Discount'
                : 'e.g. Early Payment Rebate'
            }
            required
          />
        </div>

        {/* Code Field (for TAX and DISCOUNT) */}
        {(mode === 'TAX' || mode === 'DISCOUNT') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Code / Short Abbreviation (Optional)
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={mode === 'TAX' ? 'e.g. GST-18' : 'e.g. VIP10'}
            />
          </div>
        )}

        {/* TAX specific fields */}
        {mode === 'TAX' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tax Percentage (%) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tax Type
              </label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value as TaxType)}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="EXCLUSIVE">Exclusive (Added on subtotal)</option>
                <option value="INCLUSIVE">Inclusive (Included in price)</option>
              </select>
            </div>
          </div>
        )}

        {/* DISCOUNT & RULE specific fields */}
        {(mode === 'DISCOUNT' || mode === 'RULE') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* DISCOUNT applicability */}
        {mode === 'DISCOUNT' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Applicable To
            </label>
            <select
              value={applicableTo}
              onChange={(e) => setApplicableTo(e.target.value as DiscountApplicableTo)}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="ALL">All (Entire Invoices, Quotes & Line Items)</option>
              <option value="INVOICE">Entire Invoice Only</option>
              <option value="QUOTATION">Entire Quotation Only</option>
              <option value="LINE_ITEM">Individual Line Items Only</option>
            </select>
          </div>
        )}

        {/* RULE date ranges */}
        {mode === 'RULE' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* TEMPLATE tax items selection */}
        {mode === 'TEMPLATE' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Include Taxes in Template
            </label>
            <div className="max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-2">
              {availableTaxes.length === 0 ? (
                <p className="text-xs text-slate-500">No active tax rates available. Create a tax rate first.</p>
              ) : (
                availableTaxes.map((tax) => (
                  <label key={tax.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTaxRateIds.includes(tax.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTaxRateIds((prev) => [...prev, tax.id]);
                        } else {
                          setSelectedTaxRateIds((prev) => prev.filter((id) => id !== tax.id));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{tax.name}</span>
                    <span className="text-xs text-slate-500">({tax.percentage}% - {tax.type})</span>
                  </label>
                ))
              )}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefaultTemplate"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded text-blue-600"
              />
              <label htmlFor="isDefaultTemplate" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Set as default template for new Invoices & Quotations
              </label>
            </div>
          </div>
        )}

        {/* Status field */}
        {(mode === 'TAX' || mode === 'DISCOUNT') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={taxStatus}
              onChange={(e) => setTaxStatus(e.target.value as TaxStatus)}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive (Available for records, hidden from selection)</option>
            </select>
          </div>
        )}

        {mode === 'RULE' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={ruleStatus}
              onChange={(e) => setRuleStatus(e.target.value as DiscountRuleStatus)}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter internal description or notes..."
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
