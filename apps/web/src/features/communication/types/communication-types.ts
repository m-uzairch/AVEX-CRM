export type ConversationType = 'PROJECT_CHAT' | 'DIRECT' | 'CLIENT';
export type MeetingType = 'ONLINE' | 'IN_PERSON';
export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AnnouncementType = 'COMPANY' | 'TEAM' | 'PROJECT';
export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type LinkPlatform = 'google_meet' | 'zoom' | 'teams' | 'custom';

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  companyId: string;
  senderId: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  replyToId?: string | null;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
  replyTo?: Pick<Message, 'id' | 'content' | 'sender'> | null;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  companyId: string;
  projectId?: string | null;
  type: ConversationType;
  name?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  lastMessage?: Pick<Message, 'content' | 'sender' | 'createdAt'> | null;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  user: { id: string; fullName: string; email: string; avatar?: string | null };
}

export interface MeetingNote {
  id: string;
  meetingId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; fullName: string };
}

export interface Meeting {
  id: string;
  companyId: string;
  projectId?: string | null;
  title: string;
  description?: string | null;
  organizerId: string;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingType: MeetingType;
  meetingLink?: string | null;
  linkPlatform?: string | null;
  status: MeetingStatus;
  calendarEventId?: string | null;
  isClientVisible: boolean;
  createdAt: string;
  updatedAt: string;
  organizer?: { id: string; fullName: string; email: string } | null;
  participants?: MeetingParticipant[];
  notes?: MeetingNote[];
}

export interface Announcement {
  id: string;
  companyId: string;
  projectId?: string | null;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  title: string;
  description: string;
  expiresAt?: string | null;
  authorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; fullName: string };
}
