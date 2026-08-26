/* eslint-disable @typescript-eslint/no-explicit-any */
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KPIMetricItem {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  percentageChange: number;
  trend: TrendDirection;
  iconName: string;
  description: string;
  formattedValue?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalLeads: number;
  qualifiedLeads: number;
  wonDeals: number;
  lostDeals: number;
  conversionRate: number; // percentage e.g. 24.5
  totalPipelineValue: number; // dollars e.g. 185000
  avgDealSize: number;
  winRate: number;
  lostRate: number;
  revenueForecast: number;
  kpis: KPIMetricItem[];
  recentCustomers?: Array<{
    id: string;
    name: string;
    companyName: string;
    status: string;
    createdAt: string;
  }>;
  recentLeads?: Array<{
    id: string;
    name: string;
    companyName: string;
    status: string;
    score: number;
    assignedName?: string;
    createdAt?: string;
  }>;
}

export interface SalesChartPoint {
  month: string;
  sales: number;
  revenue: number;
  pipeline: number;
  target: number;
}

export interface LeadSourceDistribution {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

export interface LeadStatusDistribution {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface CustomerIndustryDistribution {
  industry: string;
  count: number;
  percentage: number;
}

export interface PipelineStageMetrics {
  stage: string;
  label: string;
  count: number;
  value: number;
  winProbability: number;
  weightedValue: number;
  color: string;
}

export interface EmployeePerformanceItem {
  employeeId: string;
  employeeName: string;
  avatar?: string;
  jobTitle?: string;
  assignedLeads: number;
  assignedCustomers: number;
  conversionRate: number;
  completedTasks: number;
  wonDealValue: number;
}

export interface UpcomingFollowupItem {
  id: string;
  entityType: 'CUSTOMER' | 'LEAD';
  entityId: string;
  entityName: string;
  contactName: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedEmployeeName: string;
  isOverdue: boolean;
  notes?: string;
}

export interface DashboardFilterState {
  dateRange: 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  employeeId: string; // 'ALL' | employeeId
  leadSource: string; // 'ALL' | source
  industry: string; // 'ALL' | industry
  customerStatus: string; // 'ALL' | status
}

export interface WidgetPreferenceItem {
  id: string;
  title: string;
  isVisible: boolean;
  order: number;
}
