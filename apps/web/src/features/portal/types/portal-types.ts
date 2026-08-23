import { TaskPriority } from '@/features/tasks/types/task-types';
import { ProjectStatus, ProjectMilestone } from '@/features/projects/types/project-types';

export type ChangeRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OPEN';

export type RequestType =
  | 'CHANGE_REQUEST'
  | 'BUG_ISSUE'
  | 'GENERAL_REQUEST'
  | 'QUESTION'
  | 'OTHER';

export type MessageSenderType = 'CLIENT' | 'TEAM';

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type InvoicePaymentStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface RequestTimelineStep {
  key: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected' | 'cancelled';
  date?: string | null;
}

export interface RequestResponse {
  id: string;
  requestId: string;
  senderType: MessageSenderType;
  senderName: string;
  content: string;
  attachmentUrl?: string | null;
  createdAt: string;
}

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
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
  };
  company?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
}

export interface ChangeRequest {
  id: string;
  companyId: string;
  projectId: string;
  customerId: string;
  title: string;
  requestType?: RequestType;
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
    status?: string;
  };
  responses?: RequestResponse[];
  timeline?: RequestTimelineStep[];
}

export interface ClientMessage {
  id: string;
  companyId: string;
  projectId: string;
  conversationId?: string | null;
  subject?: string | null;
  senderId: string;
  senderType: MessageSenderType;
  content: string;
  attachmentUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
  project?: {
    id: string;
    projectCode: string;
    name: string;
  };
}

export interface ClientPaymentSummary {
  estimatedBudget: number;
  amountPaid: number;
  remainingBalance: number;
  nextPaymentDueDate?: string | null;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  currency: string;
}

export interface ClientProjectPhase {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  status: 'NOT_STARTED' | 'PLANNING' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
  progressPercentage: number;
  startDate?: string | null;
  dueDate?: string | null;
  completionDate?: string | null;
  isCurrent?: boolean;
}

export interface ClientProjectTask {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
  priority: TaskPriority;
  dueDate?: string | null;
  isOverdue?: boolean;
  requiresClientAction?: boolean;
  labels?: string[];
  createdAt: string;
}

export interface ClientProjectProgressStats {
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  inProgressTasks: number;
  attentionRequiredTasks: number;
  currentStatus: ProjectStatus;
  currentPhase: string;
}

export interface ClientProjectOverview {
  id: string;
  projectCode: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  priority?: string | null;
  completionPercentage: number;
  currentPhase: string;
  nextStep?: string | null;
  startDate?: string | null;
  expectedCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  lastUpdated?: string | null;
  updatedAt?: string | null;
  budget?: number | null;
  currency?: string;
  category?: {
    name: string;
    color: string;
  } | null;
  projectManager?: {
    fullName: string;
    email: string;
    phone?: string | null;
  } | null;
  milestones?: ProjectMilestone[];
  phases?: ClientProjectPhase[];
  tasks?: ClientProjectTask[];
  taskStats?: ClientProjectProgressStats;
  payments?: ClientPaymentSummary;
}

export interface ClientFinancialItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  taxRate: number;
  lineTotal: number;
  sortOrder?: number;
}

export interface ClientInvoicePaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface ClientCompanyInfo {
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  taxNumber?: string | null;
}

export interface ClientCustomerInfo {
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}

export interface ClientQuotation {
  id: string;
  quotationNumber: string;
  title: string;
  status: QuotationStatus;
  subtotal: number;
  discountAmount?: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  quoteDate?: string;
  issueDate?: string;
  validUntil?: string;
  expiryDate?: string;
  notes?: string | null;
  termsConditions?: string | null;
  itemsCount?: number;
  items?: ClientFinancialItem[];
  company?: ClientCompanyInfo;
  customer?: ClientCustomerInfo;
  project?: {
    id: string;
    name: string;
    projectCode: string;
  } | null;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  title?: string | null;
  status: InvoicePaymentStatus;
  subtotal: number;
  discountAmount?: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  issueDate?: string;
  invoiceDate?: string;
  dueDate: string;
  paidAt?: string | null;
  paymentStatusSummary?: string;
  notes?: string | null;
  termsConditions?: string | null;
  itemsCount?: number;
  items?: ClientFinancialItem[];
  payments?: ClientInvoicePaymentRecord[];
  company?: ClientCompanyInfo;
  customer?: ClientCustomerInfo;
  project?: {
    id: string;
    name: string;
    projectCode: string;
  } | null;
}

export interface ClientMeetingParticipant {
  id: string;
  name: string;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
}

export interface ClientMeeting {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingType: 'ONLINE' | 'IN_PERSON' | 'PHONE_CALL' | 'OTHER';
  meetingLink?: string | null;
  linkPlatform?: string | null;
  location?: string | null;
  durationMinutes?: number;
  status: MeetingStatus;
  organizer?: {
    id?: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  } | null;
  participants?: ClientMeetingParticipant[];
  project?: {
    id: string;
    name: string;
    projectCode: string;
    status?: string;
  } | null;
}

export interface ClientFile {
  id: string;
  name: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  category: string;
  uploadedBy?: string | null;
  uploadedAt: string;
  project?: {
    id: string;
    name: string;
    projectCode: string;
  } | null;
}

export interface ClientConversation {
  id: string;
  projectId?: string | null;
  subject: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    projectCode: string;
  } | null;
  messages?: ClientMessage[];
}

export interface ClientNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface ClientActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'PROJECT' | 'INVOICE' | 'QUOTATION' | 'MEETING' | 'REQUEST' | 'COMMUNICATION';
  link?: string | null;
}

export interface ClientFinancialOverview {
  outstandingAmount: number;
  unpaidInvoicesCount: number;
  paidAmount: number;
  paidInvoicesCount: number;
  pendingQuotationsAmount: number;
  pendingQuotationsCount: number;
  currency: string;
}

export interface ClientDashboardSummary {
  activeProjectsCount: number;
  completedProjectsCount: number;
  pendingQuotationsCount: number;
  mostRecentQuotation?: {
    quotationNumber: string;
    totalAmount: number;
    currency: string;
    validUntil: string;
  } | null;
  unpaidInvoicesCount: number;
  totalOutstandingAmount: number;
  nextMeeting?: {
    title: string;
    startTime: string;
    meetingLink?: string | null;
    linkPlatform?: string | null;
  } | null;
  openRequestsCount: number;
  mostRecentRequest?: {
    title: string;
    priority: string;
    status: string;
    createdAt: string;
  } | null;
}

export interface ClientDashboardData {
  client: ClientAccount;
  summary: ClientDashboardSummary;
  financialOverview: ClientFinancialOverview;
  activeProjects: ClientProjectOverview[];
  recentActivity: ClientActivityItem[];
  completedProjectsCount: number;
  pendingQuotations: ClientQuotation[];
  outstandingInvoices: ClientInvoice[];
  upcomingMeetings: ClientMeeting[];
  recentChangeRequests: ChangeRequest[];
  pendingPaymentsTotal: number;
  unreadMessagesCount: number;
}
