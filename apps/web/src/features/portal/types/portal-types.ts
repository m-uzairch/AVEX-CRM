import { TaskPriority } from '@/features/tasks/types/task-types';
import { ProjectStatus, ProjectMilestone } from '@/features/projects/types/project-types';

export type ChangeRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export type MessageSenderType = 'CLIENT' | 'TEAM';

export interface ClientAccount {
  id: string;
  companyId: string;
  customerId: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    companyName: string;
  };
}

export interface ChangeRequest {
  id: string;
  companyId: string;
  projectId: string;
  customerId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: ChangeRequestStatus;
  attachmentUrl?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    projectCode: string;
    name: string;
  };
}

export interface ClientMessage {
  id: string;
  companyId: string;
  projectId: string;
  senderId: string;
  senderType: MessageSenderType;
  content: string;
  attachmentUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
}

export interface ClientPaymentSummary {
  estimatedBudget: number;
  amountPaid: number;
  remainingBalance: number;
  nextPaymentDueDate?: string | null;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  currency: string;
}

export interface ClientProjectOverview {
  id: string;
  projectCode: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  completionPercentage: number;
  currentPhase: string;
  startDate?: string | null;
  expectedCompletionDate?: string | null;
  projectManager?: {
    fullName: string;
    email: string;
  } | null;
  milestones?: ProjectMilestone[];
  payments?: ClientPaymentSummary;
}

export interface ClientDashboardData {
  client: ClientAccount;
  activeProjects: ClientProjectOverview[];
  completedProjectsCount: number;
  pendingPaymentsTotal: number;
  recentChangeRequests: ChangeRequest[];
  unreadMessagesCount: number;
}
