import { Conversation, Message, Meeting, Announcement, MeetingNote, MeetingStatus } from '../types/communication-types';

// ---- Conversations ----

export async function fetchProjectConversation(projectId: string): Promise<Conversation | null> {
  const res = await fetch(`/api/conversations?projectId=${projectId}&type=PROJECT_CHAT`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.conversation ?? null;
}

export async function fetchConversationMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch messages.');
  }
  const data = await res.json();
  return data.messages;
}

export async function sendMessage(conversationId: string, content: string, replyToId?: string | null): Promise<Message> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, replyToId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send message.');
  }
  const data = await res.json();
  return data.message;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const res = await fetch(`/api/conversations/messages/${messageId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete message.');
}

// ---- Meetings ----

export async function fetchMeetings(projectId?: string): Promise<Meeting[]> {
  const url = projectId ? `/api/meetings?projectId=${projectId}` : '/api/meetings';
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.meetings;
}

export async function createMeeting(payload: {
  projectId?: string | null;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  meetingType?: 'ONLINE' | 'IN_PERSON';
  meetingLink?: string;
  linkPlatform?: string;
  isClientVisible?: boolean;
}): Promise<Meeting> {
  const res = await fetch('/api/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create meeting.');
  }
  const data = await res.json();
  return data.meeting;
}

export async function updateMeetingStatus(meetingId: string, status: MeetingStatus): Promise<Meeting> {
  const res = await fetch(`/api/meetings/${meetingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update meeting.');
  const data = await res.json();
  return data.meeting;
}

export async function addMeetingNote(meetingId: string, content: string): Promise<MeetingNote> {
  const res = await fetch(`/api/meetings/${meetingId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to add meeting note.');
  const data = await res.json();
  return data.note;
}

// ---- Announcements ----

export async function fetchAnnouncements(companyId?: string, projectId?: string): Promise<Announcement[]> {
  const params = new URLSearchParams();
  if (companyId) params.append('companyId', companyId);
  if (projectId) params.append('projectId', projectId);
  const res = await fetch(`/api/announcements?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.announcements;
}

export async function createAnnouncement(payload: {
  title: string;
  description: string;
  type: string;
  priority: string;
  projectId?: string | null;
  expiresAt?: string;
}): Promise<Announcement> {
  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create announcement.');
  }
  const data = await res.json();
  return data.announcement;
}
