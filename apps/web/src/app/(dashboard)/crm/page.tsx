/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { KPICardsGrid } from '@/features/crm/components/dashboard/kpi-cards-grid';
import { SalesAnalyticsChart } from '@/features/crm/components/dashboard/sales-analytics-chart';
import { LeadCustomerAnalytics } from '@/features/crm/components/dashboard/lead-customer-analytics';
import { PipelineForecastWidget } from '@/features/crm/components/dashboard/pipeline-forecast-widget';
import { EmployeePerformanceWidget } from '@/features/crm/components/dashboard/employee-performance-widget';
import { UpcomingFollowupsWidget } from '@/features/crm/components/dashboard/upcoming-followups-widget';
import { RecentRecordsWidget } from '@/features/crm/components/dashboard/recent-records-widget';
import { DashboardFilterToolbar } from '@/features/crm/components/dashboard/dashboard-filter-toolbar';
import { ExportReportModal } from '@/features/crm/components/dashboard/export-report-modal';
import { WidgetCustomizerModal } from '@/features/crm/components/dashboard/widget-customizer-modal';
import { ActivityTimelineView } from '@/features/crm/components/activities/activity-timeline-view';
import { CRMDashboardService } from '@/features/crm/services/crm-dashboard-service';
import { ActivityService } from '@/features/crm/services/activity-service';
import {
  DashboardStats,
  SalesChartPoint,
  LeadSourceDistribution,
  PipelineStageMetrics,
  CustomerIndustryDistribution,
  EmployeePerformanceItem,
  UpcomingFollowupItem,
  DashboardFilterState,
  WidgetPreferenceItem,
} from '@/features/crm/types/dashboard-types';
import { CRMActivityLog } from '@/features/crm/types/activity-note-types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Download, Settings, RefreshCw, Plus, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

const initialFilters: DashboardFilterState = {
  dateRange: 'THIS_MONTH',
  employeeId: 'ALL',
  leadSource: 'ALL',
  industry: 'ALL',
  customerStatus: 'ALL',
};

export default function CRMDashboardPage() {
  const [filters, setFilters] = React.useState<DashboardFilterState>(initialFilters);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [charts, setCharts] = React.useState<{
    salesChart: SalesChartPoint[];
    leadSources: LeadSourceDistribution[];
    pipelineStages: PipelineStageMetrics[];
    customerIndustries: CustomerIndustryDistribution[];
  } | null>(null);

  const [employees, setEmployees] = React.useState<EmployeePerformanceItem[]>([]);
  const [followups, setFollowups] = React.useState<UpcomingFollowupItem[]>([]);
  const [activities, setActivities] = React.useState<CRMActivityLog[]>([]);
  const [widgets, setWidgets] = React.useState<WidgetPreferenceItem[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = React.useState(false);

  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, chartsData, empData, folData, actData, widgetData] = await Promise.all([
        CRMDashboardService.fetchStats(filters),
        CRMDashboardService.fetchCharts(filters),
        CRMDashboardService.fetchEmployeePerformance(),
        CRMDashboardService.fetchUpcomingFollowups(),
        ActivityService.fetchTimeline({ pageSize: 5 }),
        CRMDashboardService.fetchWidgetPreferences(),
      ]);

      setStats(statsData);
      setCharts(chartsData);
      setEmployees(empData);
      setFollowups(folData);
      setActivities(actData.activities);
      setWidgets(widgetData);
    } catch (err) {
      console.error('Failed to load CRM dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const isWidgetVisible = (widgetId: string) => {
    const found = widgets.find((w) => w.id === widgetId);
    return found ? found.isVisible : true;
  };

  return (
    <CRMLayout
      title="CRM & Business Intelligence Dashboard"
      description="Real-time analytical overview of customer accounts, sales pipeline velocity, revenue forecasts, and employee productivity."
      breadcrumbs={[{ label: 'Dashboard' }]}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="h-9 px-3 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-blue-500" />
            <span>Export Reports</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizerOpen(true)}
            className="h-9 px-3 text-xs gap-1.5"
          >
            <Settings className="h-3.5 w-3.5 text-purple-500" />
            <span>Customize Widgets</span>
          </Button>

          <Link href="/crm/customers">
            <Button size="sm" className="h-9 px-3 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Customer</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <DashboardFilterToolbar
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={loadDashboardData}
            className="h-9 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* 1. Executive KPI Cards Grid */}
        {isWidgetVisible('widget_kpis') && (
          <KPICardsGrid kpis={stats?.kpis || []} isLoading={isLoading} />
        )}

        {/* 2. Monthly Revenue Growth & Sales Analytics Chart */}
        {isWidgetVisible('widget_sales_chart') && (
          <SalesAnalyticsChart data={charts?.salesChart || []} isLoading={isLoading} />
        )}

        {/* 3. Lead Sources & Customer Industry Breakdown */}
        {isWidgetVisible('widget_lead_customer') && (
          <LeadCustomerAnalytics
            leadSources={charts?.leadSources || []}
            customerIndustries={charts?.customerIndustries || []}
            isLoading={isLoading}
          />
        )}

        {/* 4. Sales Pipeline Stage Breakdown & Revenue Forecast */}
        {isWidgetVisible('widget_pipeline') && (
          <PipelineForecastWidget
            stages={charts?.pipelineStages || []}
            totalPipelineValue={stats?.totalPipelineValue || 245000}
            revenueForecast={stats?.revenueForecast || 168500}
            avgDealSize={stats?.avgDealSize || 18500}
            winRate={stats?.winRate || 35.2}
            isLoading={isLoading}
          />
        )}

        {/* 5. Employee Performance Scorecards */}
        {isWidgetVisible('widget_employee') && (
          <EmployeePerformanceWidget employees={employees} isLoading={isLoading} />
        )}

        {/* 6. Recent Customers & Recent Leads */}
        {isWidgetVisible('widget_recent_records') && (
          <RecentRecordsWidget isLoading={isLoading} />
        )}

        {/* 7. Upcoming Follow-up Reminders */}
        {isWidgetVisible('widget_followups') && (
          <UpcomingFollowupsWidget followups={followups} isLoading={isLoading} />
        )}

        {/* 8. Recent CRM Activity Feed */}
        {isWidgetVisible('widget_activity') && (
          <Card className="shadow-2xs border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
              <div>
                <CardTitle className="text-base font-bold flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Recent CRM Activity Feed</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest customer events, lead status transitions, and team notes.
                </CardDescription>
              </div>
              <Link href="/crm/activities">
                <span className="text-primary hover:underline text-xs font-semibold flex items-center">
                  View Full Timeline <ArrowRight className="h-3 w-3 ml-1" />
                </span>
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              <ActivityTimelineView activities={activities} isLoading={isLoading} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Dialogs */}
      {stats && (
        <ExportReportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          filters={filters}
          stats={stats}
        />
      )}

      <WidgetCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        widgets={widgets}
        onSave={setWidgets}
      />
    </CRMLayout>
  );
}
