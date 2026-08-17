import {
  ClientAccount,
  ClientDashboardData,
  ClientProjectOverview,
  ChangeRequest,
  ClientMessage,
} from '../types/portal-types';
import {
  ClientLoginFormValues,
  ChangeRequestFormValues,
  ClientProfileFormValues,
} from '../schemas/portal-schemas';

export async function clientLogin(values: ClientLoginFormValues): Promise<{ client: ClientAccount; token: string }> {
  const res = await fetch('/api/portal/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Client authentication failed.');
  }
  return res.json();
}

export async function fetchClientMe(): Promise<ClientAccount> {
  const res = await fetch('/api/portal/auth/me');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Unauthorized client session.');
  }
  const data = await res.json();
  return data.client;
}

export async function fetchClientDashboard(): Promise<ClientDashboardData> {
  const res = await fetch('/api/portal/dashboard');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load client portal dashboard.');
  }
  return res.json();
}

export async function fetchClientProjects(): Promise<ClientProjectOverview[]> {
  const res = await fetch('/api/portal/projects');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch client projects.');
  }
  const data = await res.json();
  return data.projects;
}

export async function fetchClientProjectById(id: string): Promise<ClientProjectOverview> {
  const res = await fetch(`/api/portal/projects/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch project workspace.');
  }
  const data = await res.json();
  return data.project;
}

export async function fetchChangeRequests(): Promise<ChangeRequest[]> {
  const res = await fetch('/api/portal/change-requests');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch change requests.');
  }
  const data = await res.json();
  return data.changeRequests;
}

export async function createChangeRequest(values: ChangeRequestFormValues): Promise<ChangeRequest> {
  const res = await fetch('/api/portal/change-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit change request.');
  }
  const data = await res.json();
  return data.changeRequest;
}

export async function fetchClientMessages(projectId: string): Promise<ClientMessage[]> {
  const res = await fetch(`/api/portal/messages?projectId=${projectId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch messages.');
  }
  const data = await res.json();
  return data.messages;
}

export async function sendClientMessage(projectId: string, content: string): Promise<ClientMessage> {
  const res = await fetch('/api/portal/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, content }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send message.');
  }
  const data = await res.json();
  return data.message;
}

export async function updateClientProfile(values: ClientProfileFormValues): Promise<ClientAccount> {
  const res = await fetch('/api/portal/auth/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update profile.');
  }
  const data = await res.json();
  return data.client;
}
