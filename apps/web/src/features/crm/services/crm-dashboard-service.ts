/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from '../types/dashboard-types';
import { ActivityService } from './activity-service';

export class CRMDashboardService {
  static async fetchStats(filters?: DashboardFilterState): Promise<DashboardStats> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.employeeId) params.append('employeeId', filters.employeeId);
      if (filters?.leadSource) params.append('leadSource', filters.leadSource);
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.customerStatus) params.append('customerStatus', filters.customerStatus);

      const res = await fetch(`/api/crm/dashboard/stats?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.stats) return data.stats;
      }
    } catch {
      // Fallback
    }

    return CRMDashboardService.getMockStats();
  }

  static async fetchCharts(filters?: DashboardFilterState): Promise<{
    salesChart: SalesChartPoint[];
    leadSources: LeadSourceDistribution[];
    pipelineStages: PipelineStageMetrics[];
    customerIndustries: CustomerIndustryDistribution[];
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);

      const res = await fetch(`/api/crm/dashboard/charts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          salesChart: data.salesChart || [],
          leadSources: data.leadSources || [],
          pipelineStages: data.pipelineStages || [],
          customerIndustries: data.customerIndustries || [],
        };
      }
    } catch {
      // Fallback
    }

    return CRMDashboardService.getMockCharts();
  }

  static async fetchEmployeePerformance(): Promise<EmployeePerformanceItem[]> {
    return [];
  }

  static async fetchUpcomingFollowups(): Promise<UpcomingFollowupItem[]> {
    return [];
  }

  static async exportReport(
    format: 'csv' | 'excel' | 'pdf',
    filters: DashboardFilterState,
    stats: DashboardStats
  ): Promise<void> {
    try {
      const res = await fetch('/api/crm/dashboard/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, dateRange: filters.dateRange, stats }),
      });

      if (format === 'csv') {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AVEX_CRM_Dashboard_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        alert(`Exporting ${format.toUpperCase()} Report: ${data.fileName}\nYour report has been generated successfully.`);
      }

      await ActivityService.logActivity({
        action: 'REPORT_EXPORTED',
        module: 'CRM',
        category: 'SYSTEM',
        description: `Exported CRM Executive Dashboard Report in ${format.toUpperCase()} format`,
        metadata: { format, dateRange: filters.dateRange },
      });
    } catch (err: any) {
      alert(`Failed to export report: ${err?.message || 'Unknown error'}`);
    }
  }

  static async fetchWidgetPreferences(): Promise<WidgetPreferenceItem[]> {
    try {
      const res = await fetch('/api/crm/dashboard/preferences');
      if (res.ok) {
        const data = await res.json();
        if (data.widgets && Array.isArray(data.widgets)) return data.widgets;
      }
    } catch {
      // Fallback
    }

    return CRMDashboardService.getDefaultWidgets();
  }

  static async saveWidgetPreferences(widgets: WidgetPreferenceItem[]): Promise<boolean> {
    try {
      const res = await fetch('/api/crm/dashboard/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_001', widgets }),
      });
      if (res.ok) {
        await ActivityService.logActivity({
          action: 'WIDGET_PREFERENCES_UPDATED',
          module: 'CRM',
          category: 'SYSTEM',
          description: 'Updated CRM Dashboard widget layout preferences',
        });
        return true;
      }
    } catch {
      // Fallback
    }
    return true;
  }

  private static getDefaultWidgets(): WidgetPreferenceItem[] {
    return [
      { id: 'widget_kpis', title: 'Executive KPI Metric Cards', isVisible: true, order: 1 },
      { id: 'widget_sales_chart', title: 'Monthly Revenue Growth & Sales Trend', isVisible: true, order: 2 },
      { id: 'widget_lead_customer', title: 'Lead Sources & Customer Industry Breakdown', isVisible: true, order: 3 },
      { id: 'widget_pipeline', title: 'Pipeline Stage Breakdown & Revenue Forecast', isVisible: true, order: 4 },
      { id: 'widget_employee', title: 'Employee Performance Scorecards', isVisible: true, order: 5 },
      { id: 'widget_recent_records', title: 'Recent Customers & Active Leads', isVisible: true, order: 6 },
      { id: 'widget_followups', title: 'Upcoming Follow-up Reminders', isVisible: true, order: 7 },
      { id: 'widget_activity', title: 'Recent CRM Activity Feed', isVisible: true, order: 8 },
    ];
  }

  private static getMockStats(): DashboardStats {
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      totalLeads: 0,
      qualifiedLeads: 0,
      wonDeals: 0,
      lostDeals: 0,
      conversionRate: 0,
      totalPipelineValue: 0,
      avgDealSize: 0,
      winRate: 0,
      lostRate: 0,
      revenueForecast: 0,
      recentCustomers: [],
      recentLeads: [],
      kpis: [
        {
          id: 'kpi_cust',
          title: 'Total Customers',
          value: 0,
          percentageChange: 0,
          trend: 'neutral',
          iconName: 'Users',
          description: 'Active company client profiles',
        },
        {
          id: 'kpi_active_cust',
          title: 'Active Accounts',
          value: 0,
          percentageChange: 0,
          trend: 'neutral',
          iconName: 'UserCheck',
          description: 'Paying active subscription accounts',
        },
        {
          id: 'kpi_leads',
          title: 'Total Leads',
          value: 0,
          percentageChange: 0,
          trend: 'neutral',
          iconName: 'UserPlus',
          description: 'Sales prospects captured',
        },
        {
          id: 'kpi_qual_leads',
          title: 'Qualified Pipeline',
          value: 0,
          percentageChange: 0,
          trend: 'neutral',
          iconName: 'CheckCircle2',
          description: 'High score qualified leads',
        },
        {
          id: 'kpi_won',
          title: 'Won Deals',
          value: 0,
          percentageChange: 0,
          trend: 'neutral',
          iconName: 'Trophy',
          description: 'Closed won deals',
        },
        {
          id: 'kpi_conversion',
          title: 'Conversion Rate',
          value: '0%',
          percentageChange: 0,
          trend: 'neutral',
          iconName: 'TrendingUp',
          description: 'Lead to customer conversion ratio',
        },
        {
          id: 'kpi_pipeline',
          title: 'Pipeline Value',
          value: '$0',
          percentageChange: 0,
          trend: 'neutral',
          iconName: 'DollarSign',
          description: 'Active pipeline deal revenue',
        },
        {
          id: 'kpi_forecast',
          title: 'Revenue Forecast',
          value: '$0',
          percentageChange: 0,
          trend: 'neutral',
          iconName: 'Sparkles',
          description: 'Weighted probability projection',
        },
      ],
    };
  }

  private static getMockCharts() {
    return {
      salesChart: [
        { month: 'Jan', sales: 0, revenue: 0, pipeline: 0, target: 50000 },
        { month: 'Feb', sales: 0, revenue: 0, pipeline: 0, target: 50000 },
        { month: 'Mar', sales: 0, revenue: 0, pipeline: 0, target: 50000 },
        { month: 'Apr', sales: 0, revenue: 0, pipeline: 0, target: 50000 },
        { month: 'May', sales: 0, revenue: 0, pipeline: 0, target: 50000 },
        { month: 'Jun', sales: 0, revenue: 0, pipeline: 0, target: 50000 },
      ],
      leadSources: [],
      pipelineStages: [
        { stage: 'NEW', label: 'New Lead', count: 0, value: 0, winProbability: 10, weightedValue: 0, color: '#3B82F6' },
        { stage: 'CONTACTED', label: 'Contacted', count: 0, value: 0, winProbability: 25, weightedValue: 0, color: '#6366F1' },
        { stage: 'QUALIFIED', label: 'Qualified', count: 0, value: 0, winProbability: 40, weightedValue: 0, color: '#8B5CF6' },
        { stage: 'PROPOSAL_SENT', label: 'Proposal Sent', count: 0, value: 0, winProbability: 60, weightedValue: 0, color: '#EC4899' },
        { stage: 'NEGOTIATION', label: 'Negotiation', count: 0, value: 0, winProbability: 80, weightedValue: 0, color: '#F59E0B' },
        { stage: 'WON', label: 'Won Deal', count: 0, value: 0, winProbability: 100, weightedValue: 0, color: '#10B981' },
        { stage: 'LOST', label: 'Lost', count: 0, value: 0, winProbability: 0, weightedValue: 0, color: '#EF4444' },
      ],
      customerIndustries: [],
    };
  }
}
