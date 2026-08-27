/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RecurringList } from './recurring-list';
import { RecurringFormModal } from './recurring-form-modal';
import { RecurringDetailsModal } from './recurring-details-modal';
import {
  RecurringInvoice,
  RecurringInvoiceKPISummary,
} from '../types/recurring-invoice-types';
import { Plus, Play, TrendingUp, Calendar, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface RecurringDashboardProps {
  embedded?: boolean;
}

export function RecurringDashboard({ embedded = false }: RecurringDashboardProps = {}) {
  const toastCtx = useToast();
  const [schedules, setSchedules] = React.useState<RecurringInvoice[]>([]);
  const [summary, setSummary] = React.useState<RecurringInvoiceKPISummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessingJobs, setIsProcessingJobs] = React.useState(false);

  // Modals
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState<RecurringInvoice | null>(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [resList, resSum] = await Promise.all([
        fetch('/api/invoices/recurring'),
        fetch('/api/invoices/recurring/summary'),
      ]);

      if (resList.ok) {
        const data = await resList.json();
        setSchedules(data.schedules || []);
      }
      if (resSum.ok) {
        const data = await resSum.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load recurring data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunJobs = async () => {
    setIsProcessingJobs(true);
    try {
      const res = await fetch('/api/invoices/recurring/process-jobs', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toastCtx.success(
          'Automation Completed',
          `Processed ${data.result?.processedSchedules || 0} schedules, generated ${data.result?.generatedInvoicesCount || 0} draft invoices.`
        );
        fetchData();
      }
    } catch {
      toastCtx.error('Job Error', 'Failed to execute recurring generation worker.');
    } finally {
      setIsProcessingJobs(false);
    }
  };

  const dashboardBody = (
    <div className="space-y-4 text-xs">
      {embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-base font-bold text-foreground">Recurring Billing Schedules</h3>
            <p className="text-xs text-muted-foreground">
              Automate recurring subscription schedules and generate draft invoices on due dates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunJobs}
              disabled={isProcessingJobs}
              className="h-9 px-3 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              {isProcessingJobs ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-primary text-primary" />
              )}
              <span>Run Generation Job</span>
            </Button>

            <Button size="sm" onClick={() => setIsFormOpen(true)} className="h-9 px-3 text-xs gap-1.5 bg-primary">
              <Plus className="h-3.5 w-3.5" />
              <span>New Recurring Schedule</span>
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">ACTIVE SUBSCRIPTIONS</span>
              <span className="text-xl font-bold font-mono text-foreground">
                {summary?.totalActiveSubscriptions ?? 0}
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">MONTHLY RECURRING REVENUE</span>
              <span className="text-xl font-bold font-mono text-primary">
                ${summary?.monthlyRecurringRevenue?.toLocaleString() ?? '0'} <span className="text-xs text-muted-foreground">/mo</span>
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">UPCOMING (NEXT 7 DAYS)</span>
              <span className="text-xl font-bold font-mono text-foreground">
                {summary?.upcomingInvoicesCount ?? 0}
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">EXPIRING / CANCELLED</span>
              <span className="text-xl font-bold font-mono text-foreground">
                {summary?.expiringPlansCount ?? 0}
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Schedule List */}
      <div className="mt-4">
        <RecurringList
          schedules={schedules}
          isLoading={isLoading}
          onRefresh={fetchData}
          onSelectSchedule={(s) => setSelectedSchedule(s)}
        />
      </div>

      {/* Form Modal */}
      <RecurringFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchData}
      />

      {/* Details Modal */}
      <RecurringDetailsModal
        schedule={selectedSchedule}
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
      />
    </div>
  );

  if (embedded) {
    return dashboardBody;
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Recurring Invoices & Billing Automation"
        description="Automate recurring billing schedules, track Monthly Recurring Revenue (MRR), manage subscriptions, and automatically generate draft invoices."
        breadcrumbs={[{ label: 'Invoices', href: '/invoices' }, { label: 'Recurring Invoices' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunJobs}
              disabled={isProcessingJobs}
              className="h-9 px-3 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              {isProcessingJobs ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-primary text-primary" />
              )}
              <span>Run Generation Job</span>
            </Button>

            <Button size="sm" onClick={() => setIsFormOpen(true)} className="h-9 px-3 text-xs gap-1.5 bg-primary">
              <Plus className="h-3.5 w-3.5" />
              <span>New Recurring Schedule</span>
            </Button>
          </div>
        }
      />
      {dashboardBody}
    </ContentContainer>
  );
}
