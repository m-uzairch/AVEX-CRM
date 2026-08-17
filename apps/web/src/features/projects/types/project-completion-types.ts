/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ValidationRuleResult {
  id: string;
  label: string;
  category: 'TASKS' | 'MILESTONES' | 'DELIVERABLES' | 'TEAM' | 'ISSUES';
  isPassed: boolean;
  message: string;
  details?: string;
}

export interface ProjectCompletionValidation {
  isValid: boolean;
  canOverride: boolean;
  passedRulesCount: number;
  totalRulesCount: number;
  rules: ValidationRuleResult[];
  checklist: {
    allTasksCompleted: boolean;
    allMilestonesCompleted: boolean;
    clientDeliverablesUploaded: boolean;
    finalDocUploaded: boolean;
    internalReviewCompleted: boolean;
    clientApprovalReceived: boolean;
    customItems?: { id: string; label: string; isDone: boolean }[];
  };
}

export interface DeliveryFileItem {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export interface ProjectDeliveryRecord {
  id: string;
  projectId: string;
  companyId: string;
  deliveredById: string;
  deliveredByName?: string;
  deliveredByEmail?: string;
  deliveredByAvatar?: string;
  deliveryDate: string;
  deliveryNotes?: string;
  deliveryFiles: DeliveryFileItem[];
  clientApprovalStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
  clientFeedback?: string;
  requestedChangesNotes?: string;
  deliveredAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface ProjectHistoryEvent {
  id: string;
  timestamp: string;
  category: 'CREATION' | 'MILESTONE' | 'TASK' | 'FILE' | 'COMMUNICATION' | 'DELIVERY' | 'APPROVAL' | 'ARCHIVE';
  action: string;
  title: string;
  description: string;
  performedBy?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  metadata?: any;
}

export interface ProjectCompletionReport {
  project: {
    id: string;
    projectCode: string;
    name: string;
    status: string;
    priority: string;
    customerName: string;
    customerEmail?: string;
    projectManagerName: string;
    startDate?: string;
    expectedCompletionDate?: string;
    actualCompletionDate?: string;
    durationDays: number;
  };
  summary: {
    totalTasks: number;
    completedTasks: number;
    totalMilestones: number;
    completedMilestones: number;
    totalHoursLogged: number;
    estimatedBudget: number;
    budgetUsed: number;
    budgetVariance: number;
    clientApprovalStatus: string;
    deliveryDate?: string;
  };
  teamPerformance: {
    fullName: string;
    role: string;
    completedTasksCount: number;
    hoursWorked: number;
  }[];
  deliveryDetails?: ProjectDeliveryRecord;
}
