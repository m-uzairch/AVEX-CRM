import {
  ClientAccount,
  ClientDashboardData,
  ClientProjectOverview,
  ChangeRequest,
  RequestResponse,
  ClientMessage,
  ClientConversation,
  ClientQuotation,
  ClientInvoice,
  ClientMeeting,
  ClientFile,
  ClientNotification,
} from '../types/portal-types';
import {
  ClientLoginFormValues,
  ChangeRequestFormValues,
  ClientProfileFormValues,
  MeetingRequestFormValues,
  ClientFileUploadValues,
  CreateConversationFormValues,
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

export async function clientLogout(): Promise<void> {
  await fetch('/api/portal/auth/logout', { method: 'POST' }).catch(() => {});
  document.cookie = 'client_session=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export async function fetchClientMe(): Promise<ClientAccount> {
  const res = await fetch('/api/portal/auth/me');
  if (!res.ok) {
    if (res.status === 401 && typeof document !== 'undefined') {
      document.cookie = 'client_session=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Unauthorized client session.');
  }
  const data = await res.json();
  return data.client;
}

export async function fetchClientDashboard(): Promise<ClientDashboardData> {
  const res = await fetch('/api/portal/dashboard');
  if (!res.ok) {
    if (res.status === 401 && typeof document !== 'undefined') {
      document.cookie = 'client_session=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
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
  return data.projects || [];
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

export async function fetchClientQuotations(): Promise<{ quotations: ClientQuotation[]; kpis?: any }> {
  const res = await fetch('/api/portal/quotations');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch client quotations.');
  }
  const data = await res.json();
  return {
    quotations: data.quotations || [],
    kpis: data.kpis,
  };
}

export async function fetchClientQuotationById(id: string): Promise<ClientQuotation> {
  const res = await fetch(`/api/portal/quotations/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch quotation details.');
  }
  const data = await res.json();
  return data.quotation;
}

export async function fetchClientInvoices(): Promise<{ invoices: ClientInvoice[]; kpis?: any }> {
  const res = await fetch('/api/portal/invoices');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch client invoices.');
  }
  const data = await res.json();
  return {
    invoices: data.invoices || [],
    kpis: data.kpis,
  };
}

export async function fetchClientInvoiceById(id: string): Promise<ClientInvoice> {
  const res = await fetch(`/api/portal/invoices/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch invoice details.');
  }
  const data = await res.json();
  return data.invoice;
}

export async function fetchChangeRequests(params?: {
  status?: string;
  projectId?: string;
  type?: string;
  search?: string;
}): Promise<{ requests: ChangeRequest[]; kpis?: any }> {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
  if (params?.projectId && params.projectId !== 'ALL') searchParams.set('projectId', params.projectId);
  if (params?.type && params.type !== 'ALL') searchParams.set('type', params.type);
  if (params?.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const res = await fetch(`/api/portal/requests${queryString}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch change requests.');
  }
  const data = await res.json();
  return {
    requests: data.requests || data.changeRequests || [],
    kpis: data.kpis,
  };
}

export async function fetchChangeRequestById(id: string): Promise<ChangeRequest> {
  const res = await fetch(`/api/portal/requests/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch request details.');
  }
  const data = await res.json();
  return data.request;
}

export async function createChangeRequest(values: ChangeRequestFormValues): Promise<ChangeRequest> {
  const res = await fetch('/api/portal/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit change request.');
  }
  const data = await res.json();
  return data.request || data.changeRequest;
}

export async function addRequestResponse(
  requestId: string,
  values: { content: string; attachmentUrl?: string | null }
): Promise<RequestResponse> {
  const res = await fetch(`/api/portal/requests/${requestId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit response.');
  }
  const data = await res.json();
  return data.response;
}

export async function cancelChangeRequest(requestId: string): Promise<ChangeRequest> {
  const res = await fetch(`/api/portal/requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'CANCEL' }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to cancel request.');
  }
  const data = await res.json();
  return data.request;
}

export async function fetchClientMeetings(params?: {
  status?: string;
  type?: string;
  timeFilter?: 'upcoming' | 'past' | 'all';
  projectId?: string;
  search?: string;
}): Promise<{
  meetings: ClientMeeting[];
  upcoming: ClientMeeting[];
  past: ClientMeeting[];
  kpis?: { upcomingCount: number; pastCount: number; totalCount: number };
}> {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
  if (params?.type && params.type !== 'ALL') searchParams.set('type', params.type);
  if (params?.timeFilter && params.timeFilter !== 'all') searchParams.set('timeFilter', params.timeFilter);
  if (params?.projectId && params.projectId !== 'ALL') searchParams.set('projectId', params.projectId);
  if (params?.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const res = await fetch(`/api/portal/meetings${queryString}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch meetings.');
  }
  const data = await res.json();
  const allMeetings: ClientMeeting[] = data.meetings || [];
  const now = new Date();

  const upcoming = data.upcoming || allMeetings.filter((m) => new Date(m.startTime) >= now && m.status !== 'CANCELLED');
  const past = data.past || allMeetings.filter((m) => new Date(m.startTime) < now || m.status === 'COMPLETED' || m.status === 'CANCELLED');

  return {
    meetings: allMeetings,
    upcoming,
    past,
    kpis: data.kpis || {
      upcomingCount: upcoming.length,
      pastCount: past.length,
      totalCount: allMeetings.length,
    },
  };
}

export async function fetchClientMeetingById(id: string): Promise<ClientMeeting> {
  const res = await fetch(`/api/portal/meetings/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch meeting details.');
  }
  const data = await res.json();
  return data.meeting;
}

export async function cancelClientMeeting(id: string): Promise<ClientMeeting> {
  const res = await fetch(`/api/portal/meetings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'CANCEL' }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to cancel meeting.');
  }
  const data = await res.json();
  return data.meeting;
}

export async function requestClientMeeting(values: MeetingRequestFormValues): Promise<ClientMeeting> {
  const res = await fetch('/api/portal/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to schedule meeting.');
  }
  const data = await res.json();
  return data.meeting;
}

export async function fetchClientFiles(params?: {
  category?: string;
  projectId?: string;
  search?: string;
}): Promise<ClientFile[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== 'ALL') searchParams.set('category', params.category);
  if (params?.projectId && params.projectId !== 'ALL') searchParams.set('projectId', params.projectId);
  if (params?.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const res = await fetch(`/api/portal/files${queryString}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch shared files.');
  }
  const data = await res.json();
  return data.files || [];
}

export async function uploadClientFile(values: ClientFileUploadValues): Promise<ClientFile> {
  const res = await fetch('/api/portal/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload file.');
  }
  const data = await res.json();
  return data.file;
}

export async function fetchClientConversations(params?: {
  projectId?: string;
  search?: string;
}): Promise<ClientConversation[]> {
  const searchParams = new URLSearchParams();
  if (params?.projectId && params.projectId !== 'ALL') searchParams.set('projectId', params.projectId);
  if (params?.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const res = await fetch(`/api/portal/messages${queryString}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch conversations.');
  }
  const data = await res.json();
  return data.conversations || [];
}

export async function fetchClientConversationById(id: string): Promise<ClientConversation> {
  const res = await fetch(`/api/portal/messages/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch conversation.');
  }
  const data = await res.json();
  return data.conversation;
}

export async function createClientConversation(values: CreateConversationFormValues): Promise<ClientConversation> {
  const res = await fetch('/api/portal/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create conversation.');
  }
  const data = await res.json();
  return data.conversation || data.message;
}

export async function replyClientConversation(
  conversationId: string,
  content: string,
  attachmentUrl?: string | null
): Promise<ClientMessage> {
  const res = await fetch(`/api/portal/messages/${conversationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, attachmentUrl }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to post reply.');
  }
  const data = await res.json();
  return data.message;
}

export async function fetchClientMessages(projectId?: string): Promise<ClientMessage[]> {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  const res = await fetch(`/api/portal/messages${query}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch messages.');
  }
  const data = await res.json();
  return data.messages || [];
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

export async function fetchClientNotifications(): Promise<ClientNotification[]> {
  const res = await fetch('/api/portal/notifications');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch notifications.');
  }
  const data = await res.json();
  return data.notifications || [];
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
