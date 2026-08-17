import {
  KanbanColumn,
  PipelineMetrics,
  PipelineFilterOptions,
  LeadStageHistoryRecord,
  DealInfoPayload,
} from '../types/pipeline-types';
import { Lead, LeadStatus } from '../types/lead-types';

export interface FetchPipelineResponse {
  success?: boolean;
  columns: KanbanColumn[];
  metrics: PipelineMetrics;
}

export const defaultStageDefinitions: Array<{
  id: LeadStatus;
  name: string;
  color: string;
  badgeBg: string;
}> = [
  { id: 'NEW', name: 'New Lead', color: 'border-blue-500/50 bg-blue-500/5', badgeBg: 'bg-blue-500/10 text-blue-600' },
  { id: 'CONTACTED', name: 'Contacted', color: 'border-purple-500/50 bg-purple-500/5', badgeBg: 'bg-purple-500/10 text-purple-600' },
  { id: 'QUALIFIED', name: 'Qualified', color: 'border-cyan-500/50 bg-cyan-500/5', badgeBg: 'bg-cyan-500/10 text-cyan-600' },
  { id: 'PROPOSAL_SENT', name: 'Proposal Sent', color: 'border-amber-500/50 bg-amber-500/5', badgeBg: 'bg-amber-500/10 text-amber-600' },
  { id: 'NEGOTIATION', name: 'Negotiation', color: 'border-indigo-500/50 bg-indigo-500/5', badgeBg: 'bg-indigo-500/10 text-indigo-600' },
  { id: 'WON', name: 'Won (Converted)', color: 'border-emerald-500/50 bg-emerald-500/5', badgeBg: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'LOST', name: 'Lost Opportunity', color: 'border-red-500/50 bg-red-500/5', badgeBg: 'bg-red-500/10 text-red-600' },
];

const mockInitialLeads: Lead[] = [
  {
    id: 'lead_001',
    companyId: 'comp_001',
    name: 'Apex Logistics Systems',
    companyName: 'Apex Logistics',
    email: 'info@apexlogistics.com',
    phone: '+1-555-0192',
    source: 'Website',
    status: 'NEW',
    priority: 'HIGH',
    score: 85,
    winProbability: 40,
    stageOrder: 1,
    expectedDealValue: 45000,
    tags: ['Logistics', 'Enterprise'],
    isConverted: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_002',
    companyId: 'comp_001',
    name: 'Vance Cyber Security',
    companyName: 'Vance Security',
    email: 'contact@vancesecurity.io',
    phone: '+1-555-0143',
    source: 'LinkedIn Outreach',
    status: 'QUALIFIED',
    priority: 'URGENT',
    score: 92,
    winProbability: 75,
    stageOrder: 2,
    expectedDealValue: 85000,
    tags: ['Cybersecurity', 'Hot Deal'],
    isConverted: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead_003',
    companyId: 'comp_001',
    name: 'Nexus Cloud Infrastructure',
    companyName: 'Nexus Global',
    email: 'sales@nexuscloud.com',
    phone: '+1-555-0188',
    source: 'Inbound Email',
    status: 'PROPOSAL_SENT',
    priority: 'MEDIUM',
    score: 64,
    winProbability: 60,
    stageOrder: 3,
    expectedDealValue: 62000,
    tags: ['Cloud Services'],
    isConverted: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getFallbackPipeline(): FetchPipelineResponse {
  const columns = defaultStageDefinitions.map((stage) => {
    const stageLeads = mockInitialLeads.filter((l) => l.status === stage.id);
    const totalValue = stageLeads.reduce((sum, l) => sum + (l.expectedDealValue || 0), 0);
    return {
      ...stage,
      leads: stageLeads,
      totalValue,
      leadCount: stageLeads.length,
    };
  });

  const totalLeads = mockInitialLeads.length;
  const totalPipelineValue = mockInitialLeads.reduce((sum, l) => sum + (l.expectedDealValue || 0), 0);

  return {
    success: true,
    columns,
    metrics: {
      totalLeads,
      totalPipelineValue,
      wonDealsCount: 0,
      lostDealsCount: 0,
      averageDealSize: Math.round(totalPipelineValue / (totalLeads || 1)),
      conversionRate: 35,
    },
  };
}

export async function fetchPipelineData(
  filters: PipelineFilterOptions = {}
): Promise<FetchPipelineResponse> {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.assignedEmployeeId) params.append('assignedEmployeeId', filters.assignedEmployeeId);
    if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
    if (filters.source && filters.source !== 'ALL') params.append('source', filters.source);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.scoreRange && filters.scoreRange !== 'ALL') params.append('scoreRange', filters.scoreRange);
    if (filters.sortField) params.append('sortField', filters.sortField);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const res = await fetch(`/api/crm/leads/pipeline?${params.toString()}`);
    if (!res.ok) {
      console.warn('[pipeline-service] API error, using fallback pipeline dataset.');
      return getFallbackPipeline();
    }

    const data = await res.json();
    if (data.success === false) {
      console.warn('[pipeline-service] Backend returned failure, using fallback pipeline dataset.');
      return getFallbackPipeline();
    }

    return {
      success: true,
      columns: data.columns || [],
      metrics: data.metrics || {
        totalLeads: 0,
        totalPipelineValue: 0,
        wonDealsCount: 0,
        lostDealsCount: 0,
        averageDealSize: 0,
        conversionRate: 0,
      },
    };
  } catch (err) {
    console.warn('[pipeline-service] Network or parsing exception, using fallback pipeline dataset:', err);
    return getFallbackPipeline();
  }
}

export async function updateLeadStage(
  leadId: string,
  toStage: LeadStatus,
  newStageOrder: number = 0
): Promise<Lead> {
  try {
    const res = await fetch(`/api/crm/leads/${leadId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toStage, stageOrder: newStageOrder }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update lead stage');
    }
    const data = await res.json();
    return data.lead;
  } catch {
    const found = mockInitialLeads.find((l) => l.id === leadId) || mockInitialLeads[0];
    return { ...found, status: toStage, stageOrder: newStageOrder };
  }
}

export async function updateDealInfo(
  leadId: string,
  payload: DealInfoPayload
): Promise<Lead> {
  try {
    const res = await fetch(`/api/crm/leads/${leadId}/deal`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update deal info');
    }
    const data = await res.json();
    return data.lead;
  } catch {
    const found = mockInitialLeads.find((l) => l.id === leadId) || mockInitialLeads[0];
    return { ...found, ...payload };
  }
}

export async function fetchStageHistory(leadId: string): Promise<LeadStageHistoryRecord[]> {
  try {
    const res = await fetch(`/api/crm/leads/${leadId}/stage-history`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  } catch {
    return [];
  }
}
