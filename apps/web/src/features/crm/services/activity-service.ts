/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CRMActivityLog,
  ActivityFilterState,
} from '../types/activity-note-types';

const INITIAL_MOCK_ACTIVITIES: CRMActivityLog[] = [];

const localActivitiesState: CRMActivityLog[] = [...INITIAL_MOCK_ACTIVITIES];

export class ActivityService {
  static async fetchTimeline(filters?: Partial<ActivityFilterState> & { entityType?: string; entityId?: string }): Promise<{
    activities: CRMActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.module) params.append('module', filters.module);
      if (filters?.action) params.append('action', filters.action);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.entityType) params.append('entityType', filters.entityType);
      if (filters?.entityId) params.append('entityId', filters.entityId);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

      const res = await fetch(`/api/crm/activities?${params.toString()}`);
      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      if (data.activities && Array.isArray(data.activities)) {
        return {
          activities: data.activities.map(ActivityService.normalizeActivity),
          total: data.pagination?.total || data.activities.length,
          page: data.pagination?.page || 1,
          totalPages: data.pagination?.totalPages || 1,
        };
      }
    } catch {
      // Offline / Fallback implementation
    }

    let result = [...localActivitiesState];

    if (filters?.entityType) {
      result = result.filter((a) => a.entityType === filters.entityType);
    }
    if (filters?.entityId) {
      result = result.filter((a) => a.entityId === filters.entityId);
    }
    if (filters?.module && filters.module !== 'ALL') {
      result = result.filter((a) => a.module === filters.module);
    }
    if (filters?.action && filters.action !== 'ALL') {
      result = result.filter((a) => a.action === filters.action);
    }
    if (filters?.userId && filters.userId !== 'ALL') {
      result = result.filter((a) => a.userId === filters.userId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.description.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          (a.user?.fullName && a.user.fullName.toLowerCase().includes(q))
      );
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const total = result.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paged = result.slice((page - 1) * pageSize, page * pageSize);

    return {
      activities: paged,
      total,
      page,
      totalPages,
    };
  }

  static async logActivity(payload: {
    action: string;
    module: string;
    category?: string;
    entityType?: string;
    entityId?: string;
    entityName?: string;
    description: string;
    metadata?: any;
  }): Promise<CRMActivityLog> {
    try {
      const res = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'comp_001',
          userId: 'user_001',
          ...payload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activity) {
          const act = ActivityService.normalizeActivity(data.activity);
          localActivitiesState.unshift(act);
          return act;
        }
      }
    } catch {
      // Fallback
    }

    const fallbackAct: CRMActivityLog = {
      id: `act_${Date.now()}`,
      companyId: 'comp_001',
      userId: 'user_001',
      user: { fullName: 'Alex Carter', email: 'alex.carter@avexcrm.io' },
      action: payload.action,
      module: payload.module,
      category: payload.category || payload.module,
      entityType: payload.entityType,
      entityId: payload.entityId,
      entityName: payload.entityName,
      description: payload.description,
      metadata: payload.metadata || null,
      timestamp: new Date().toISOString(),
    };

    localActivitiesState.unshift(fallbackAct);
    return fallbackAct;
  }

  private static normalizeActivity(raw: any): CRMActivityLog {
    return {
      id: raw.id,
      companyId: raw.companyId || 'comp_001',
      userId: raw.userId || raw.user?.id,
      user: raw.user
        ? {
            fullName: raw.user.fullName || 'Team Member',
            email: raw.user.email,
            avatar: raw.user.avatar,
          }
        : null,
      action: raw.action,
      module: raw.module || raw.category || 'CRM',
      category: raw.category || raw.module || 'CRM',
      entityType: raw.entityType,
      entityId: raw.entityId,
      entityName: raw.entityName,
      description: raw.description,
      metadata: raw.metadata,
      timestamp: raw.timestamp || raw.createdAt || new Date().toISOString(),
    };
  }
}
