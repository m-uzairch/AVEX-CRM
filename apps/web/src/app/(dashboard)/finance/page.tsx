/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { PaymentsDashboardView } from '@/features/payments/components/payments-dashboard-view';
import { ExpensesDashboardView } from '@/features/expenses/components/expenses-dashboard-view';
import { TaxDashboard } from '@/features/taxes/components/tax-dashboard';
import { DollarSign, Receipt, Percent, Tag } from 'lucide-react';

export type FinanceTab = 'payments' | 'expenses' | 'taxes' | 'discounts';

const financeTabs: TabItem[] = [
  { id: 'payments', label: 'Payments', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'expenses', label: 'Expenses', icon: <Receipt className="h-4 w-4" /> },
  { id: 'taxes', label: 'Tax Configuration', icon: <Percent className="h-4 w-4" /> },
  { id: 'discounts', label: 'Discounts & Rules', icon: <Tag className="h-4 w-4" /> },
];

function FinanceHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams?.get('tab') as FinanceTab;
  const validTabs: FinanceTab[] = ['payments', 'expenses', 'taxes', 'discounts'];
  const resolvedTab = validTabs.includes(tabParam) ? tabParam : 'payments';

  const [activeTab, setActiveTab] = React.useState<FinanceTab>(resolvedTab);

  React.useEffect(() => {
    if (resolvedTab !== activeTab) {
      setActiveTab(resolvedTab);
    }
  }, [resolvedTab, activeTab]);

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as FinanceTab;
    setActiveTab(nextTab);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', nextTab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Finance & Treasury Hub"
        description="Unified financial operations management for cash collection receipts, operating expense claims, global tax rates, and corporate discount rules."
        breadcrumbs={[{ label: 'Finance' }]}
      />

      {/* Tabs Navigation */}
      <div className="mt-4 mb-6">
        <Tabs tabs={financeTabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Sub-view Panels */}
      <div className="mt-4">
        {activeTab === 'payments' && <PaymentsDashboardView />}

        {activeTab === 'expenses' && <ExpensesDashboardView />}

        {activeTab === 'taxes' && (
          <TaxDashboard
            initialTab="rates"
            allowedTabs={['rates', 'templates', 'summary']}
            hideHeader={true}
          />
        )}

        {activeTab === 'discounts' && (
          <TaxDashboard
            initialTab="discounts"
            allowedTabs={['discounts', 'rules', 'summary']}
            hideHeader={true}
          />
        )}
      </div>
    </ContentContainer>
  );
}

export default function FinanceHubPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading finance...</div>}>
      <FinanceHubContent />
    </React.Suspense>
  );
}
