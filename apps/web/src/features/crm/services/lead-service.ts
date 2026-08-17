import {
  Lead,
  LeadFilters,
  LeadFormValues,
  LeadNote,
  LeadConversionPayload,
  LeadBulkActionPayload,
  LeadStats,
} from '../types/lead-types';

export interface FetchLeadsResponse {
  data: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats?: LeadStats;
}

export const defaultLeadSources = [
  'Website',
  'Referral',
  'Facebook',
  'Instagram',
  'LinkedIn',
  'Google Ads',
  'WhatsApp',
  'Email Campaign',
  'Cold Call',
  'Walk-in',
  'Trade Show',
  'Other',
];

export async function fetchLeads(filters: LeadFilters = {}): Promise<FetchLeadsResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.source) params.append('source', filters.source);
  if (filters.assignedEmployeeId) params.append('assignedEmployeeId', filters.assignedEmployeeId);
  if (filters.scoreRange) params.append('scoreRange', filters.scoreRange);
  if (filters.industry) params.append('industry', filters.industry);
  if (filters.isArchived !== undefined) params.append('isArchived', String(filters.isArchived));
  if (filters.isDeleted !== undefined) params.append('isDeleted', String(filters.isDeleted));
  if (filters.sortField) params.append('sortField', filters.sortField);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
  if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));

  const res = await fetch(`/api/crm/leads?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch leads');
  }
  return res.json();
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const res = await fetch(`/api/crm/leads/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch lead details');
  }
  const data = await res.json();
  return data.lead;
}

export async function createLead(data: LeadFormValues): Promise<Lead> {
  const res = await fetch('/api/crm/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create lead');
  }
  const result = await res.json();
  return result.lead;
}

export async function updateLead(id: string, data: Partial<LeadFormValues>): Promise<Lead> {
  const res = await fetch(`/api/crm/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update lead');
  }
  const result = await res.json();
  return result.lead;
}

export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`/api/crm/leads/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete lead');
  }
}

export async function archiveLead(id: string, isArchived: boolean): Promise<Lead> {
  const res = await fetch(`/api/crm/leads/${id}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isArchived }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to archive lead');
  }
  const result = await res.json();
  return result.lead;
}

export async function restoreLead(id: string): Promise<Lead> {
  const res = await fetch(`/api/crm/leads/${id}/restore`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to restore lead');
  }
  const result = await res.json();
  return result.lead;
}

export async function convertLeadToCustomer(
  id: string,
  payload?: LeadConversionPayload
): Promise<{ customerId: string; lead: Lead }> {
  const res = await fetch(`/api/crm/leads/${id}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to convert lead to customer');
  }
  return res.json();
}

export async function assignLead(id: string, assignedEmployeeId: string): Promise<Lead> {
  return updateLead(id, { assignedEmployeeId });
}

export async function addLeadNote(leadId: string, content: string): Promise<LeadNote> {
  const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add note');
  }
  const result = await res.json();
  return result.note;
}

export async function deleteLeadNote(leadId: string, noteId: string): Promise<void> {
  const res = await fetch(`/api/crm/leads/${leadId}/notes/${noteId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete note');
  }
}

export async function executeLeadBulkAction(
  payload: LeadBulkActionPayload
): Promise<{ count: number }> {
  const res = await fetch('/api/crm/leads/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to execute bulk action');
  }
  return res.json();
}

export async function exportLeads(
  filters: LeadFilters = {},
  format: 'csv' | 'excel' = 'csv'
): Promise<void> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.source) params.append('source', filters.source);
  if (filters.assignedEmployeeId) params.append('assignedEmployeeId', filters.assignedEmployeeId);
  params.append('format', format);

  const res = await fetch(`/api/crm/leads/export?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Export failed');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-export-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
