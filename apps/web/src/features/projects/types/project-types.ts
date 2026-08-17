export type ProjectStatus =
  | 'PLANNING'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ProjectMemberRole = 'PROJECT_MANAGER' | 'MEMBER' | 'VIEWER';

export type ProjectMilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type BusinessTypeOption = 'PHYSICAL' | 'DIGITAL';

export type ProjectHealthStatus = 'HEALTHY' | 'AT_RISK' | 'DELAYED';

export type ProjectTabId =
  | 'overview'
  | 'tasks'
  | 'milestones'
  | 'team'
  | 'files'
  | 'meetings'
  | 'notes'
  | 'activity'
  | 'reports'
  | 'history'
  | 'completion';

export interface ProjectCategory {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  companyId: string;
  title: string;
  description?: string | null;
  order: number;
  status: ProjectMilestoneStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  companyId: string;
  content: string;
  isPinned: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  businessType: BusinessTypeOption;
  categoryName: string;
  defaultStatus: ProjectStatus;
  defaultPriority: ProjectPriority;
  defaultMilestones: { title: string; description: string; order: number }[];
}

export interface Project {
  id: string;
  companyId: string;
  projectCode: string;
  name: string;
  description?: string | null;
  customerId?: string | null;
  projectManagerId?: string | null;
  categoryId?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  businessType?: string | null;
  currency?: string;
  templateId?: string | null;
  startDate?: string | null;
  expectedCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  budget?: number | null;
  isArchived: boolean;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  customer?: {
    id: string;
    name: string;
    companyName: string;
    email?: string;
    phone?: string;
  } | null;
  projectManager?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  } | null;
  category?: ProjectCategory | null;
  members?: ProjectMember[];
  milestones?: ProjectMilestone[];
  notes?: ProjectNote[];
}

export interface ProjectTimelineMetrics {
  daysElapsed: number;
  remainingDays: number;
  totalDays: number;
  isOverdue: boolean;
  formattedStartDate: string;
  formattedDueDate: string;
}

export interface ProjectProgressMetrics {
  completionPercentage: number;
  totalMilestones: number;
  completedMilestones: number;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  currentPhase: string;
}

export interface ProjectFinancialSummary {
  estimatedBudget: number;
  amountInvoiced: number;
  paymentsReceived: number;
  remainingBalance: number;
  currency: string;
}

export interface ProjectActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user?: {
    fullName: string;
  };
}

export interface ProjectDashboardData {
  project: Project;
  health: ProjectHealthStatus;
  timeline: ProjectTimelineMetrics;
  progress: ProjectProgressMetrics;
  financials: ProjectFinancialSummary;
  activities: ProjectActivityLog[];
  notes: ProjectNote[];
  milestones: ProjectMilestone[];
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTeamMembers: number;
  totalTasks: number;
}

export interface ProjectFilterParams {
  search?: string;
  status?: ProjectStatus | 'ALL';
  priority?: ProjectPriority | 'ALL';
  categoryId?: string | 'ALL';
  projectManagerId?: string | 'ALL';
  isArchived?: boolean;
  page?: number;
  pageSize?: number;
  sortField?: 'name' | 'createdAt' | 'expectedCompletionDate' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProjectsResponse {
  data: Project[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ViewMode = 'grid' | 'table';
