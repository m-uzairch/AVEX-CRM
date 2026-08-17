export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LeadScoreRange = 'COLD' | 'WARM' | 'HOT' | 'VERY_HOT';

export interface LeadAssignedEmployee {
  id: string;
  fullName: string;
  email: string;
  avatar?: string | null;
}

export interface LeadNote {
  id: string;
  leadId: string;
  companyId: string;
  content: string;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivityLog {
  id: string;
  action: string;
  module: string;
  description: string;
  timestamp: string;
  user?: {
    fullName: string;
  } | null;
}

export interface Lead {
  id: string;
  companyId: string;
  assignedEmployeeId?: string | null;
  assignedEmployee?: LeadAssignedEmployee | null;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  alternatePhone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  postalCode?: string | null;
  industry?: string | null;
  businessType?: string | null;
  website?: string | null;
  companySize?: string | null;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  score: number; // 0 - 100
  winProbability?: number;
  stageOrder?: number;
  expectedDealValue?: number | null;
  expectedClosingDate?: string | null;
  tags: string[];
  convertedCustomerId?: string | null;
  convertedCustomer?: {
    id: string;
    name: string;
    companyName: string;
  } | null;
  isConverted: boolean;
  convertedAt?: string | null;
  isArchived: boolean;
  deletedAt?: string | null;
  lastContactAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: LeadNote[];
  activityLogs?: LeadActivityLog[];
}

export interface LeadFilters {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  assignedEmployeeId?: string;
  scoreRange?: string; // 'COLD' | 'WARM' | 'HOT' | 'VERY_HOT'
  industry?: string;
  tags?: string[];
  isArchived?: boolean;
  isDeleted?: boolean;
  startDate?: string;
  endDate?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface LeadStats {
  totalLeads: number;
  hotLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalDealValue: number;
}

export interface LeadFormValues {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  industry?: string;
  businessType?: string;
  website?: string;
  companySize?: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  assignedEmployeeId?: string;
  expectedDealValue?: number;
  expectedClosingDate?: string;
  tags: string[];
}

export interface LeadConversionPayload {
  customerStatus?: string;
  notes?: string;
}

export type LeadBulkActionType =
  | 'ASSIGN_EMPLOYEE'
  | 'CHANGE_STATUS'
  | 'CHANGE_PRIORITY'
  | 'ADD_TAGS'
  | 'REMOVE_TAGS'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'DELETE';

export interface LeadBulkActionPayload {
  leadIds: string[];
  action: LeadBulkActionType;
  assignedEmployeeId?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  tags?: string[];
}
