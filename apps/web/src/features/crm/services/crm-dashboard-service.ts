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
    return [
      {
        employeeId: 'emp_001',
        employeeName: 'Alex Carter',
        avatar: '/avatars/alex.jpg',
        jobTitle: 'Senior Account Executive',
        assignedLeads: 32,
        assignedCustomers: 45,
        conversionRate: 34.2,
        completedTasks: 128,
        wonDealValue: 185000,
      },
      {
        employeeId: 'emp_002',
        employeeName: 'Jordan Smith',
        avatar: '/avatars/jordan.jpg',
        jobTitle: 'Sales Development Rep',
        assignedLeads: 28,
        assignedCustomers: 31,
        conversionRate: 28.5,
        completedTasks: 94,
        wonDealValue: 120000,
      },
      {
        employeeId: 'emp_003',
        employeeName: 'Ali Hassan',
        avatar: '/avatars/ali.jpg',
        jobTitle: 'Customer Success Manager',
        assignedLeads: 14,
        assignedCustomers: 52,
        conversionRate: 42.1,
        completedTasks: 156,
        wonDealValue: 95000,
      },
      {
        employeeId: 'emp_004',
        employeeName: 'Sarah Miller',
        avatar: '/avatars/sarah.jpg',
        jobTitle: 'Enterprise SDR',
        assignedLeads: 22,
        assignedCustomers: 18,
        conversionRate: 22.8,
        completedTasks: 76,
        wonDealValue: 84000,
      },
    ];
  }

  static async fetchUpcomingFollowups(): Promise<UpcomingFollowupItem[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const inThreeDays = new Date(today);
    inThreeDays.setDate(today.getDate() + 3);

    return [
      {
        id: 'fol_001',
        entityType: 'LEAD',
        entityId: 'lead_001',
        entityName: 'Apex Systems Inc.',
        contactName: 'Elena Rostova',
        dueDate: yesterday.toISOString(),
        priority: 'URGENT',
        assignedEmployeeName: 'Alex Carter',
        isOverdue: true,
        notes: 'Follow up on technical architecture review call and custom proposal pricing.',
      },
      {
        id: 'fol_002',
        entityType: 'CUSTOMER',
        entityId: 'cust_001',
        entityName: 'Acuity Solutions',
        contactName: 'Sarah Jenkins',
        dueDate: today.toISOString(),
        priority: 'HIGH',
        assignedEmployeeName: 'Alex Carter',
        isOverdue: false,
        notes: 'Quarterly renewal call to discuss seat expansion & enterprise addon modules.',
      },
      {
        id: 'fol_003',
        entityType: 'LEAD',
        entityId: 'lead_002',
        entityName: 'Vance Tech Labs',
        contactName: 'Michael Vance',
        dueDate: tomorrow.toISOString(),
        priority: 'MEDIUM',
        assignedEmployeeName: 'Jordan Smith',
        isOverdue: false,
        notes: 'Send updated contract terms and schedule final demo with CTO.',
      },
      {
        id: 'fol_004',
        entityType: 'CUSTOMER',
        entityId: 'cust_002',
        entityName: 'Nexus Global Software',
        contactName: 'David Zhang',
        dueDate: inThreeDays.toISOString(),
        priority: 'LOW',
        assignedEmployeeName: 'Ali Hassan',
        isOverdue: false,
        notes: 'Onboarding check-in call and support ticket review.',
      },
    ];
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
      totalCustomers: 124,
      activeCustomers: 98,
      totalLeads: 86,
      qualifiedLeads: 42,
      wonDeals: 18,
      lostDeals: 6,
      conversionRate: 24.8,
      totalPipelineValue: 245000,
      avgDealSize: 18500,
      winRate: 35.2,
      lostRate: 12.4,
      revenueForecast: 168500,
      kpis: [
        {
          id: 'kpi_cust',
          title: 'Total Customers',
          value: 124,
          percentageChange: 12.4,
          trend: 'up',
          iconName: 'Users',
          description: 'Active company client profiles',
        },
        {
          id: 'kpi_active_cust',
          title: 'Active Accounts',
          value: 98,
          percentageChange: 8.7,
          trend: 'up',
          iconName: 'UserCheck',
          description: 'Paying active subscription accounts',
        },
        {
          id: 'kpi_leads',
          title: 'Total Leads',
          value: 86,
          percentageChange: 15.2,
          trend: 'up',
          iconName: 'UserPlus',
          description: 'Sales prospects captured',
        },
        {
          id: 'kpi_qual_leads',
          title: 'Qualified Pipeline',
          value: 42,
          percentageChange: 9.3,
          trend: 'up',
          iconName: 'CheckCircle2',
          description: 'High score qualified leads',
        },
        {
          id: 'kpi_won',
          title: 'Won Deals',
          value: 18,
          percentageChange: 22.1,
          trend: 'up',
          iconName: 'Trophy',
          description: 'Closed won deals',
        },
        {
          id: 'kpi_conversion',
          title: 'Conversion Rate',
          value: '24.8%',
          percentageChange: 2.3,
          trend: 'up',
          iconName: 'TrendingUp',
          description: 'Lead to customer conversion ratio',
        },
        {
          id: 'kpi_pipeline',
          title: 'Pipeline Value',
          value: '$245k',
          percentageChange: 14.8,
          trend: 'up',
          iconName: 'DollarSign',
          description: 'Active pipeline deal revenue',
        },
        {
          id: 'kpi_forecast',
          title: 'Revenue Forecast',
          value: '$168k',
          percentageChange: 11.2,
          trend: 'up',
          iconName: 'Sparkles',
          description: 'Weighted probability projection',
        },
      ],
    };
  }

  private static getMockCharts() {
    return {
      salesChart: [
        { month: 'Jan', sales: 12, revenue: 45000, pipeline: 85000, target: 50000 },
        { month: 'Feb', sales: 15, revenue: 52000, pipeline: 92000, target: 55000 },
        { month: 'Mar', sales: 18, revenue: 64000, pipeline: 110000, target: 60000 },
        { month: 'Apr', sales: 14, revenue: 58000, pipeline: 105000, target: 60000 },
        { month: 'May', sales: 22, revenue: 78000, pipeline: 130000, target: 65000 },
        { month: 'Jun', sales: 26, revenue: 89000, pipeline: 145000, target: 70000 },
      ],
      leadSources: [
        { source: 'Website', count: 42, percentage: 48.8, color: '#3B82F6' },
        { source: 'LinkedIn Outreach', count: 24, percentage: 27.9, color: '#8B5CF6' },
        { source: 'Referrals', count: 12, percentage: 14.0, color: '#10B981' },
        { source: 'Inbound Email', count: 8, percentage: 9.3, color: '#F59E0B' },
      ],
      pipelineStages: [
        { stage: 'NEW', label: 'New Lead', count: 18, value: 45000, winProbability: 10, weightedValue: 4500, color: '#3B82F6' },
        { stage: 'CONTACTED', label: 'Contacted', count: 14, value: 52000, winProbability: 25, weightedValue: 13000, color: '#6366F1' },
        { stage: 'QUALIFIED', label: 'Qualified', count: 12, value: 68000, winProbability: 40, weightedValue: 27200, color: '#8B5CF6' },
        { stage: 'PROPOSAL_SENT', label: 'Proposal Sent', count: 8, value: 85000, winProbability: 60, weightedValue: 51000, color: '#EC4899' },
        { stage: 'NEGOTIATION', label: 'Negotiation', count: 6, value: 95000, winProbability: 80, weightedValue: 76000, color: '#F59E0B' },
        { stage: 'WON', label: 'Won Deal', count: 18, value: 145000, winProbability: 100, weightedValue: 145000, color: '#10B981' },
      ],
      customerIndustries: [
        { industry: 'Software & Technology', count: 54, percentage: 43.5 },
        { industry: 'Financial Services', count: 28, percentage: 22.5 },
        { industry: 'Healthcare & Pharma', count: 18, percentage: 14.5 },
        { industry: 'Logistics & Retail', count: 14, percentage: 11.3 },
        { industry: 'Professional Services', count: 10, percentage: 8.2 },
      ],
    };
  }
}
