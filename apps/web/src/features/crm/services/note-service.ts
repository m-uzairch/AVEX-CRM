/* eslint-disable @typescript-eslint/no-explicit-any */
import { CRMNote, NoteAttachment, UserMention } from '../types/activity-note-types';
import { ActivityService } from './activity-service';

export class NoteService {
  static async fetchNotes(entityType: 'CUSTOMER' | 'LEAD', entityId: string): Promise<CRMNote[]> {
    const endpoint =
      entityType === 'CUSTOMER'
        ? `/api/crm/customers/${entityId}/notes`
        : `/api/crm/leads/${entityId}/notes`;

    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data.notes && Array.isArray(data.notes)) {
          return data.notes.map((n: any) => NoteService.normalizeNote(n, entityType, entityId));
        }
      }
    } catch {
      // Fallback handled in component state
    }
    return [];
  }

  static async createNote(payload: {
    entityType: 'CUSTOMER' | 'LEAD';
    entityId: string;
    content: string;
    isPinned?: boolean;
    attachments?: NoteAttachment[];
    mentions?: UserMention[];
  }): Promise<CRMNote> {
    const endpoint =
      payload.entityType === 'CUSTOMER'
        ? `/api/crm/customers/${payload.entityId}/notes`
        : `/api/crm/leads/${payload.entityId}/notes`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: payload.content,
          isPinned: Boolean(payload.isPinned),
          attachments: payload.attachments || [],
          mentions: payload.mentions || [],
          createdById: 'user_001',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create note');
      }

      const data = await res.json();
      if (data.note) {
        return NoteService.normalizeNote(data.note, payload.entityType, payload.entityId);
      }
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
    }

    // Fallback Offline Object
    const fallbackNote: CRMNote = {
      id: `note_${Date.now()}`,
      entityType: payload.entityType,
      entityId: payload.entityId,
      companyId: 'comp_001',
      content: payload.content,
      isPinned: Boolean(payload.isPinned),
      attachments: payload.attachments || [],
      mentions: payload.mentions || [],
      createdById: 'user_001',
      createdBy: {
        id: 'user_001',
        fullName: 'Alex Carter',
        email: 'alex.carter@avexcrm.io',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log Activity
    await ActivityService.logActivity({
      action: payload.entityType === 'CUSTOMER' ? 'NOTE_ADDED' : 'LEAD_NOTE_ADDED',
      module: payload.entityType === 'CUSTOMER' ? 'CUSTOMERS' : 'LEADS',
      category: payload.entityType === 'CUSTOMER' ? 'CUSTOMERS' : 'LEADS',
      entityType: payload.entityType,
      entityId: payload.entityId,
      description: `Added internal team note`,
      metadata: {
        noteId: fallbackNote.id,
        hasAttachments: Boolean(payload.attachments?.length),
        mentionsCount: payload.mentions?.length || 0,
      },
    });

    return fallbackNote;
  }

  static async updateNote(payload: {
    entityType: 'CUSTOMER' | 'LEAD';
    entityId: string;
    noteId: string;
    content?: string;
    isPinned?: boolean;
    attachments?: NoteAttachment[];
    mentions?: UserMention[];
  }): Promise<CRMNote> {
    const endpoint =
      payload.entityType === 'CUSTOMER'
        ? `/api/crm/customers/${payload.entityId}/notes`
        : `/api/crm/leads/${payload.entityId}/notes`;

    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: payload.noteId,
          content: payload.content,
          isPinned: payload.isPinned,
          attachments: payload.attachments,
          mentions: payload.mentions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.note) {
          return NoteService.normalizeNote(data.note, payload.entityType, payload.entityId);
        }
      }
    } catch {
      // Offline fallback
    }

    return {
      id: payload.noteId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      companyId: 'comp_001',
      content: payload.content || '',
      isPinned: Boolean(payload.isPinned),
      attachments: payload.attachments || [],
      mentions: payload.mentions || [],
      createdById: 'user_001',
      createdBy: { fullName: 'Alex Carter' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  static async deleteNote(
    entityType: 'CUSTOMER' | 'LEAD',
    entityId: string,
    noteId: string
  ): Promise<boolean> {
    const endpoint =
      entityType === 'CUSTOMER'
        ? `/api/crm/customers/${entityId}/notes?noteId=${noteId}`
        : `/api/crm/leads/${entityId}/notes?noteId=${noteId}`;

    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // Offline
    }
    return true;
  }

  static async uploadAttachment(file: File): Promise<NoteAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/crm/attachments', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload attachment.');
    }

    const data = await res.json();
    return data.attachment;
  }

  static async fetchUserMentions(query: string = ''): Promise<UserMention[]> {
    try {
      const res = await fetch(`/api/crm/users/mentions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          return data.users.map((u: any) => ({
            userId: u.id,
            fullName: u.fullName,
            email: u.email,
          }));
        }
      }
    } catch {
      // Fallback
    }

    const mockUsers: UserMention[] = [
      { userId: 'user_001', fullName: 'Alex Carter', email: 'alex.carter@avexcrm.io' },
      { userId: 'user_002', fullName: 'Jordan Smith', email: 'jordan.smith@avexcrm.io' },
      { userId: 'user_003', fullName: 'Ali Hassan', email: 'ali.hassan@avexcrm.io' },
      { userId: 'user_004', fullName: 'Sarah Miller', email: 'sarah.miller@avexcrm.io' },
    ];

    if (!query) return mockUsers;
    const q = query.toLowerCase();
    return mockUsers.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  private static normalizeNote(raw: any, entityType: 'CUSTOMER' | 'LEAD', entityId: string): CRMNote {
    return {
      id: raw.id,
      entityType,
      entityId,
      companyId: raw.companyId || 'comp_001',
      content: raw.content,
      isPinned: Boolean(raw.isPinned),
      attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
      mentions: Array.isArray(raw.mentions) ? raw.mentions : [],
      createdById: raw.createdById || 'user_001',
      createdBy: raw.createdBy
        ? {
            id: raw.createdBy.id,
            fullName: raw.createdBy.fullName || 'Alex Carter',
            email: raw.createdBy.email,
            avatar: raw.createdBy.avatar,
          }
        : { fullName: raw.createdByName || 'Alex Carter' },
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  }
}
