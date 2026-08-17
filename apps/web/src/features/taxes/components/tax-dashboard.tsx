'use client';

import * as React from 'react';
import {
  TaxRate,
  TaxTemplate,
  Discount,
  DiscountRule,
  TaxFilterState,
  DiscountFilterState,
  TaxRateInput,
  TaxTemplateInput,
  DiscountInput,
  DiscountRuleInput,
  TaxSummary,
  DiscountSummary,
} from '../types/tax-types';
import { TaxList } from './tax-list';
import { TaxTemplateManager } from './tax-template-manager';
import { DiscountList } from './discount-list';
import { DiscountRulesPage } from './discount-rules-page';
import { TaxSummaryView } from './tax-summary-view';
import { TaxModal } from './tax-modal';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { Receipt, Layers, Tag, Zap, BarChart3 } from 'lucide-react';

export function TaxDashboard() {
  const [activeTab, setActiveTab] = React.useState('rates');

  // Data states
  const [taxes, setTaxes] = React.useState<TaxRate[]>([]);
  const [templates, setTemplates] = React.useState<TaxTemplate[]>([]);
  const [discounts, setDiscounts] = React.useState<Discount[]>([]);
  const [rules, setRules] = React.useState<DiscountRule[]>([]);
  const [taxSummary, setTaxSummary] = React.useState<TaxSummary | null>(null);
  const [discountSummary, setDiscountSummary] = React.useState<DiscountSummary | null>(null);

  const [loading, setLoading] = React.useState(true);

  // Modal control
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'TAX' | 'TEMPLATE' | 'DISCOUNT' | 'RULE'>('TAX');
  const [editingItem, setEditingItem] = React.useState<any>(null);

  // Fetch functions
  const fetchTaxes = async (filters: TaxFilterState = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);

      const res = await fetch(`/api/taxes?${params.toString()}`);
      const data = await res.json();
      if (data.taxes) setTaxes(data.taxes);
    } catch (err) {
      console.error('Failed to fetch taxes:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/taxes/templates');
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const fetchDiscounts = async (filters: DiscountFilterState = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);
      if (filters.applicableTo && filters.applicableTo !== 'ALL') params.set('applicableTo', filters.applicableTo);

      const res = await fetch(`/api/discounts?${params.toString()}`);
      const data = await res.json();
      if (data.discounts) setDiscounts(data.discounts);
    } catch (err) {
      console.error('Failed to fetch discounts:', err);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/discounts/rules');
      const data = await res.json();
      if (data.rules) setRules(data.rules);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    }
  };

  const fetchSummaries = async () => {
    try {
      const [resTax, resDisc] = await Promise.all([
        fetch('/api/taxes/summary'),
        fetch('/api/discounts/summary'),
      ]);
      const dataTax = await resTax.json();
      const dataDisc = await resDisc.json();

      if (dataTax.summary) setTaxSummary(dataTax.summary);
      if (dataDisc.summary) setDiscountSummary(dataDisc.summary);
    } catch (err) {
      console.error('Failed to fetch summaries:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTaxes(),
      fetchTemplates(),
      fetchDiscounts(),
      fetchRules(),
      fetchSummaries(),
    ]);
    setLoading(false);
  };

  React.useEffect(() => {
    loadAllData();
  }, []);

  // Modal Handlers
  const handleOpenCreateModal = (mode: 'TAX' | 'TEMPLATE' | 'DISCOUNT' | 'RULE') => {
    setModalMode(mode);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (mode: 'TAX' | 'TEMPLATE' | 'DISCOUNT' | 'RULE', item: any) => {
    setModalMode(mode);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Actions
  const handleSaveTax = async (data: TaxRateInput) => {
    if (editingItem?.id) {
      await fetch(`/api/taxes/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    await fetchTaxes();
    await fetchSummaries();
  };

  const handleSaveTemplate = async (data: TaxTemplateInput) => {
    await fetch('/api/taxes/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchTemplates();
    await fetchSummaries();
  };

  const handleSaveDiscount = async (data: DiscountInput) => {
    if (editingItem?.id) {
      await fetch(`/api/discounts/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    await fetchDiscounts();
    await fetchSummaries();
  };

  const handleSaveRule = async (data: DiscountRuleInput) => {
    if (editingItem?.id) {
      await fetch(`/api/discounts/rules/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/discounts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    await fetchRules();
    await fetchSummaries();
  };

  const handleDeleteTax = async (id: string) => {
    if (!confirm('Are you sure you want to soft-delete this tax rate?')) return;
    await fetch(`/api/taxes/${id}`, { method: 'DELETE' });
    await fetchTaxes();
    await fetchSummaries();
  };

  const handleToggleTaxStatus = async (tax: TaxRate) => {
    const newStatus = tax.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await fetch(`/api/taxes/${tax.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchTaxes();
  };

  const handleSetDefaultTemplate = async (templateId: string) => {
    await fetch('/api/taxes/templates/default', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId }),
    });
    await fetchTemplates();
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;
    await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
    await fetchDiscounts();
    await fetchSummaries();
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount rule?')) return;
    await fetch(`/api/discounts/rules/${id}`, { method: 'DELETE' });
    await fetchRules();
    await fetchSummaries();
  };

  const dashboardTabs: TabItem[] = [
    { id: 'rates', label: 'Tax Rates', count: taxes.length, icon: <Receipt className="h-4 w-4" /> },
    { id: 'templates', label: 'Templates', count: templates.length, icon: <Layers className="h-4 w-4" /> },
    { id: 'discounts', label: 'Discounts', count: discounts.length, icon: <Tag className="h-4 w-4" /> },
    { id: 'rules', label: 'Discount Rules', count: rules.length, icon: <Zap className="h-4 w-4 text-amber-500" /> },
    { id: 'summary', label: 'Reports & Analytics', icon: <BarChart3 className="h-4 w-4 text-blue-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-xl text-white shadow-md">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-7 w-7 text-blue-400" /> Tax & Discount Management
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Configure global tax rates, country tax templates, inclusive/exclusive calculation methods, and discount rules across Invoices & Quotations.
          </p>
        </div>
      </div>

      {/* Tabs Header */}
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content Panels */}
      <div className="mt-6">
        {activeTab === 'rates' && (
          <TaxList
            taxes={taxes}
            loading={loading}
            onRefresh={fetchTaxes}
            onOpenCreateModal={() => handleOpenCreateModal('TAX')}
            onEditTax={(t) => handleEditItem('TAX', t)}
            onDeleteTax={handleDeleteTax}
            onToggleStatus={handleToggleTaxStatus}
            onFilterChange={fetchTaxes}
          />
        )}

        {activeTab === 'templates' && (
          <TaxTemplateManager
            templates={templates}
            loading={loading}
            onOpenCreateModal={() => handleOpenCreateModal('TEMPLATE')}
            onSetDefault={handleSetDefaultTemplate}
          />
        )}

        {activeTab === 'discounts' && (
          <DiscountList
            discounts={discounts}
            loading={loading}
            onOpenCreateModal={() => handleOpenCreateModal('DISCOUNT')}
            onEditDiscount={(d) => handleEditItem('DISCOUNT', d)}
            onDeleteDiscount={handleDeleteDiscount}
            onFilterChange={fetchDiscounts}
          />
        )}

        {activeTab === 'rules' && (
          <DiscountRulesPage
            rules={rules}
            loading={loading}
            onOpenCreateModal={() => handleOpenCreateModal('RULE')}
            onEditRule={(r) => handleEditItem('RULE', r)}
            onDeleteRule={handleDeleteRule}
          />
        )}

        {activeTab === 'summary' && (
          <TaxSummaryView
            taxSummary={taxSummary}
            discountSummary={discountSummary}
            loading={loading}
          />
        )}
      </div>

      {/* Modal Dialog */}
      <TaxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={editingItem}
        availableTaxes={taxes.filter((t) => t.status === 'ACTIVE')}
        onSaveTax={handleSaveTax}
        onSaveTemplate={handleSaveTemplate}
        onSaveDiscount={handleSaveDiscount}
        onSaveRule={handleSaveRule}
      />
    </div>
  );
}
