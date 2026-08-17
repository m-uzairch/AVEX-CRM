import { Lead, LeadStatus, LeadPriority } from './lead-types';

export interface LeadStageHistoryRecord {
  id: string;
  leadId: string;
  companyId: string;
  fromStage: LeadStatus;
  toStage: LeadStatus;
  updatedById?: string | null;
  updatedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface KanbanColumn {
  id: LeadStatus;
  name: string;
  color: string;
  badgeBg: string;
  leads: Lead[];
  totalValue: number;
  leadCount: number;
}

export interface PipelineMetrics {
  totalLeads: number;
  totalPipelineValue: number;
  wonDealsCount: number;
  lostDealsCount: number;
  averageDealSize: number;
  conversionRate: number;
}

export interface PipelineFilterOptions {
  search?: string;
  assignedEmployeeId?: string;
  priority?: LeadPriority | 'ALL';
  source?: string;
  industry?: string;
  scoreRange?: string;
  tags?: string[];
  sortField?: 'name' | 'expectedDealValue' | 'score' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface StageMovePayload {
  leadId: string;
  toStage: LeadStatus;
  newStageOrder?: number;
}

export interface DealInfoPayload {
  expectedDealValue?: number;
  expectedClosingDate?: string;
  winProbability?: number;
}
