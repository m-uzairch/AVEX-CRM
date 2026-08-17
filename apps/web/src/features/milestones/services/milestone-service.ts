import {
  ProjectMilestone,
  GanttBar,
  MilestoneFilterParams,
  MilestoneStatus,
  MilestonePriority,
} from '../types/milestone-types';

export async function fetchMilestones(
  params: MilestoneFilterParams
): Promise<ProjectMilestone[]> {
  const query = new URLSearchParams();
  query.append('projectId', params.projectId);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
  if (params.includeArchived) query.append('includeArchived', 'true');

  const res = await fetch(`/api/milestones?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch milestones.');
  }
  const data = await res.json();
  return data.milestones;
}

export async function createMilestone(payload: {
  projectId: string;
  title: string;
  description?: string;
  status?: MilestoneStatus;
  priority?: MilestonePriority;
  startDate?: string;
  dueDate?: string;
  progressPercentage?: number;
  estimatedHours?: number;
  budgetAllocation?: number;
}): Promise<ProjectMilestone> {
  const res = await fetch('/api/milestones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create milestone.');
  }
  const data = await res.json();
  return data.milestone;
}

export async function updateMilestone(
  milestoneId: string,
  updates: Partial<{
    title: string;
    description: string;
    status: MilestoneStatus;
    priority: MilestonePriority;
    startDate: string;
    dueDate: string;
    progressPercentage: number;
    estimatedHours: number;
    budgetAllocation: number;
  }>
): Promise<ProjectMilestone> {
  const res = await fetch(`/api/milestones/${milestoneId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update milestone.');
  }
  const data = await res.json();
  return data.milestone;
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  const res = await fetch(`/api/milestones/${milestoneId}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete milestone.');
  }
}

export async function archiveMilestone(
  milestoneId: string,
  restore = false
): Promise<ProjectMilestone> {
  const res = await fetch(`/api/milestones/${milestoneId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restore }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to archive/restore milestone.');
  }
  const data = await res.json();
  return data.milestone;
}

export async function fetchGanttData(projectId: string): Promise<GanttBar[]> {
  const res = await fetch(`/api/milestones/gantt?projectId=${projectId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch Gantt data.');
  }
  const data = await res.json();
  return data.ganttBars;
}
