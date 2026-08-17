/* eslint-disable @typescript-eslint/no-explicit-any */

export type DateRangeOption =
  | 'ALL'
  | 'TODAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_YEAR'
  | 'CUSTOM';

export interface ReportFilterState {
  dateRange: DateRangeOption;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  projectManagerId?: string;
  employeeId?: string;
  customerId?: string;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}

export type ProjectHealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface ProjectReportSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  cancelledTasks: number;
  activeEmployees: number;
  totalHoursLogged: number;
  totalEstimatedBudget: number;
  totalBudgetUsed: number;
  budgetVariance: number;
  healthyProjectsCount: number;
  warningProjectsCount: number;
  criticalProjectsCount: number;
}

export interface ProjectPerformanceMetric {
  id: string;
  projectCode: string;
  name: string;
  status: string;
  priority: string;
  customerName?: string;
  projectManagerName?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  completionPercentage: number;
  totalMilestones: number;
  completedMilestones: number;
  milestoneProgressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionPercentage: number;
  isDelayed: boolean;
  delayDays: number;
  daysRemaining: number;
  estimatedCompletionDate?: string;
  budget: number;
  budgetUsed: number;
  budgetRemaining: number;
  budgetVariance: number;
  healthStatus: ProjectHealthStatus;
  healthScore: number;
}

export interface EmployeePerformanceMetric {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  assignedProjectsCount: number;
  assignedTasksCount: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  hoursWorked: number;
  averageTaskCompletionHours: number;
  availableCapacityPercentage: number;
  isOverloaded: boolean;
}

export interface TaskAnalyticsMetric {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  cancelledTasks: number;
  tasksByStatus: { status: string; count: number; color: string }[];
  tasksByPriority: { priority: string; count: number; color: string }[];
  tasksByEmployee: { employeeName: string; taskCount: number; completedCount: number }[];
  completionTrend: { date: string; completed: number; created: number }[];
}

export interface MilestoneAnalyticsMetric {
  totalMilestones: number;
  completedMilestones: number;
  delayedMilestones: number;
  upcomingMilestones: number;
  milestonesByStatus: { status: string; count: number }[];
  milestonesByPriority: { priority: string; count: number }[];
  completionTrend: { period: string; completed: number; delayed: number }[];
}

export interface TimeTrackingMetric {
  totalHoursLogged: number;
  averageTaskDurationHours: number;
  overtimeHours: number;
  hoursByEmployee: { employeeName: string; hours: number }[];
  hoursByProject: { projectCode: string; projectName: string; hours: number }[];
  dailyTimeTrend: { date: string; hours: number }[];
}

export interface BudgetReportMetric {
  totalEstimatedBudget: number;
  totalBudgetUsed: number;
  totalRemainingBudget: number;
  aggregateVariance: number;
  projectBudgets: {
    projectId: string;
    projectCode: string;
    projectName: string;
    estimatedBudget: number;
    budgetUsed: number;
    remainingBudget: number;
    variancePercentage: number;
    isOverBudget: boolean;
  }[];
}

export interface ResourceUtilizationMetric {
  totalTeamMembers: number;
  avgWorkloadPercentage: number;
  overloadedMembersCount: number;
  employeeWorkloads: {
    userId: string;
    fullName: string;
    avatar?: string;
    activeProjectsCount: number;
    activeTasksCount: number;
    estimatedHoursRemaining: number;
    capacityPercentage: number;
    isOverloaded: boolean;
  }[];
}

export interface ReportWidgetConfig {
  id: string;
  title: string;
  category: string;
  isVisible: boolean;
  order: number;
}

export interface ScheduledReportJob {
  id: string;
  companyId: string;
  title: string;
  reportType: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipients: string[];
  exportFormat: 'PDF' | 'EXCEL' | 'CSV';
  filters?: ReportFilterState;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
}

export interface ReportExportHistoryItem {
  id: string;
  title: string;
  reportType: string;
  exportFormat: 'PDF' | 'EXCEL' | 'CSV';
  fileUrl?: string;
  fileSize?: number;
  generatedByName?: string;
  createdAt: string;
}

export interface CombinedProjectAnalyticsResponse {
  summary: ProjectReportSummary;
  projectPerformance: ProjectPerformanceMetric[];
  teamPerformance: EmployeePerformanceMetric[];
  taskAnalytics: TaskAnalyticsMetric;
  milestoneAnalytics: MilestoneAnalyticsMetric;
  timeTracking: TimeTrackingMetric;
  budgetReports: BudgetReportMetric;
  resourceUtilization: ResourceUtilizationMetric;
  charts: {
    projectGrowth: { month: string; created: number; completed: number }[];
    taskCompletionArea: { date: string; completed: number; pending: number }[];
    employeeProductivityBar: { name: string; completedTasks: number; hoursLogged: number }[];
    budgetDistributionPie: { name: string; value: number; color: string }[];
    milestoneProgressComposed: { name: string; total: number; completed: number; delayed: number }[];
  };
}
