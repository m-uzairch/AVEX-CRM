export type MilestoneStatus =
  | 'NOT_STARTED'
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'DELAYED'
  | 'CANCELLED';

export type MilestonePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MilestoneAssignee {
  id: string;
  milestoneId: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface MilestoneDependency {
  id: string;
  milestoneId: string;
  dependsOnMilestoneId: string;
  dependsOn?: {
    id: string;
    title: string;
    status: MilestoneStatus;
  };
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  companyId: string;
  title: string;
  description?: string | null;
  order: number;
  status: MilestoneStatus;
  priority: MilestonePriority;
  startDate?: string | null;
  dueDate?: string | null;
  completionDate?: string | null;
  progressPercentage: number;
  estimatedHours?: number | null;
  budgetAllocation?: number | null;
  isArchived: boolean;
  deletedAt?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  assignees?: MilestoneAssignee[];
  dependencies?: MilestoneDependency[];
  blockedBy?: MilestoneDependency[];
  createdBy?: { id: string; fullName: string } | null;

  // Computed
  isOverdue?: boolean;
  daysOverdue?: number;
  daysRemaining?: number;
}

export interface GanttBar {
  id: string;
  title: string;
  status: MilestoneStatus;
  priority: MilestonePriority;
  startDate: string;
  dueDate: string;
  progressPercentage: number;
  isOverdue: boolean;
}

export type TimelineZoom = 'week' | 'month' | 'quarter';

export interface MilestoneFilterParams {
  projectId: string;
  status?: MilestoneStatus | 'ALL';
  priority?: MilestonePriority | 'ALL';
  includeArchived?: boolean;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  projectId: string;
  projectName?: string;
  dueDate: string;
  priority: MilestonePriority;
  status: MilestoneStatus;
  daysRemaining: number;
  isOverdue: boolean;
}
