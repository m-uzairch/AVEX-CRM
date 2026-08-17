/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { FinancialKPICards } from '@/features/financial-dashboard/components/financial-kpi-cards';
import { FinancialFilterBar } from '@/features/financial-dashboard/components/financial-filter-bar';
import { RevenueTrendChart } from '@/features/financial-dashboard/components/revenue-trend-chart';
import { ExpenseBreakdownChart } from '@/features/financial-dashboard/components/expense-breakdown-chart';
import { InvoiceAnalyticsChart } from '@/features/financial-dashboard/components/invoice-analytics-chart';
import { ProjectProfitabilityTable } from '@/features/financial-dashboard/components/project-profitability-table';
import { TopCustomersTable } from '@/features/financial-dashboard/components/top-customers-table';
import { WidgetSettingsModal } from '@/features/financial-dashboard/components/widget-settings-modal';
import {
  CompleteFinancialSummary,
  WidgetPreferences,
  FinancialDateRange,
} from '@/features/financial-dashboard/types/financial-dashboard-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Activity, Clock } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export default function FinancialDashboardPage() {
  const toastCtx = useToast();
  const [summary, setSummary] = React.useState<CompleteFinancialSummary | null>(null);
  const [preferences, setPreferences] = React.useState<WidgetPreferences>({
    visibleWidgets: [
      'REVENUE_TREND',
      'EXPENSE_BREAKDOWN',
      'INVOICE_ANALYTICS',
      'PROJECT_PROFITABILITY',
      'TOP_CUSTOMERS',
      'RECENT_ACTIVITIES',
    ],
    widgetOrder: [],
    defaultDateRange: 'THIS_YEAR',
  });

  const [dateRange, setDateRange] = React.useState<FinancialDateRange>('THIS_YEAR');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

  const fetchSummary = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [resSummary, resPrefs] = await Promise.all([
        fetch(`/api/financial-dashboard?dateRange=${dateRange}`),
        fetch('/api/financial-dashboard/preferences'),
      ]);

      if (resSummary.ok) {
        const data = await resSummary.json();
        setSummary(data);
      }
      if (resPrefs.ok) {
        const data = await resPrefs.json();
        if (data.preferences) setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Failed to fetch financial dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const res = await fetch('/api/financial-dashboard/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, dateRange }),
      });

      if (res.ok) {
        if (format === 'csv') {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `financial_summary_${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          toastCtx.success('Export Successful', 'Financial summary downloaded in CSV format.');
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      toastCtx.error('Export Error', 'Failed to export dashboard data.');
    }
  };

  const isWidgetVisible = (widgetId: string) => {
    return (preferences.visibleWidgets || []).includes(widgetId);
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Financial Dashboard & Performance"
        description="Real-time financial overview, revenue analytics, expense breakdowns, project profitability, and client accounts."
        breadcrumbs={[{ label: 'Financial Dashboard' }]}
      />

      <div className="space-y-6 text-xs mt-4">
        {/* Filter & Preferences Toolbar */}
        <FinancialFilterBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onExport={handleExport}
        />

        {isLoading || !summary ? (
          <div className="py-20 text-center text-muted-foreground text-xs">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Aggregating financial analytics workspace...
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <FinancialKPICards kpis={summary.kpis} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {isWidgetVisible('REVENUE_TREND') && (
                <div className="lg:col-span-2">
                  <RevenueTrendChart data={summary.monthlyTrends} />
                </div>
              )}

              {isWidgetVisible('EXPENSE_BREAKDOWN') && (
                <div>
                  <ExpenseBreakdownChart data={summary.expenseCategories} />
                </div>
              )}
            </div>

            {/* Analytics Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {isWidgetVisible('INVOICE_ANALYTICS') && (
                <div>
                  <InvoiceAnalyticsChart data={summary.invoiceStatuses} />
                </div>
              )}

              {isWidgetVisible('PROJECT_PROFITABILITY') && (
                <div className="lg:col-span-2">
                  <ProjectProfitabilityTable data={summary.projectProfitability} />
                </div>
              )}
            </div>

            {/* Analytics Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {isWidgetVisible('TOP_CUSTOMERS') && (
                <div className="lg:col-span-2">
                  <TopCustomersTable data={summary.topCustomers} />
                </div>
              )}

              {isWidgetVisible('RECENT_ACTIVITIES') && (
                <Card className="shadow-2xs border-border">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <CardTitle className="text-sm font-bold flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span>Recent Financial Audit Feed</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2 text-xs">
                    {summary.recentActivities.length === 0 ? (
                      <div className="text-muted-foreground text-center py-4">No recent financial logs.</div>
                    ) : (
                      summary.recentActivities.map((act) => (
                        <div key={act.id} className="p-2 rounded-lg bg-muted/20 border border-border/40 text-[11px]">
                          <div className="flex justify-between items-center font-bold text-foreground">
                            <span>{act.title}</span>
                            {act.amount && <span className="font-mono text-emerald-600">+${act.amount.toFixed(2)}</span>}
                          </div>
                          <p className="text-muted-foreground text-[10px] truncate">{act.description}</p>
                          <div className="text-[9px] text-muted-foreground font-mono mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(act.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      {/* Widget Settings Modal */}
      {isSettingsModalOpen && (
        <WidgetSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          preferences={preferences}
          onSaved={(newPrefs) => setPreferences(newPrefs)}
        />
      )}
    </ContentContainer>
  );
}
