import {
  Project,
  ProjectMilestone,
  ProjectHealthStatus,
  ProjectTimelineMetrics,
  ProjectProgressMetrics,
  ProjectFinancialSummary,
  ProjectDashboardData,
  ProjectNote,
  ProjectMilestoneStatus,
} from '../types/project-types';

export function calculateProjectHealth(
  project: Project,
  milestones: ProjectMilestone[] = []
): ProjectHealthStatus {
  if (project.status === 'COMPLETED') return 'HEALTHY';
  if (project.status === 'ON_HOLD' || project.status === 'CANCELLED') return 'AT_RISK';

  const now = new Date();

  // Check if project target due date has passed
  if (project.expectedCompletionDate) {
    const dueDate = new Date(project.expectedCompletionDate);
    if (now > dueDate) {
      return 'DELAYED';
    }
  }

  // Check if any milestones are overdue
  const overdueMilestones = milestones.filter((m) => {
    if (m.status === 'COMPLETED' || !m.dueDate) return false;
    return new Date(m.dueDate) < now;
  });

  if (overdueMilestones.length >= 2) return 'DELAYED';
  if (overdueMilestones.length === 1) return 'AT_RISK';

  return 'HEALTHY';
}

export function calculateProjectTimeline(project: Project): ProjectTimelineMetrics {
  const start = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
  const due = project.expectedCompletionDate
    ? new Date(project.expectedCompletionDate)
    : new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days default

  const now = new Date();

  const totalTimeMs = Math.max(due.getTime() - start.getTime(), 1);
  const elapsedTimeMs = Math.max(now.getTime() - start.getTime(), 0);

  const totalDays = Math.ceil(totalTimeMs / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.min(Math.ceil(elapsedTimeMs / (1000 * 60 * 60 * 24)), totalDays);
  const remainingDays = Math.max(totalDays - daysElapsed, 0);
  const isOverdue = now > due && project.status !== 'COMPLETED';

  return {
    daysElapsed,
    remainingDays,
    totalDays,
    isOverdue,
    formattedStartDate: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    formattedDueDate: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
}

export function calculateProjectProgress(
  project: Project,
  milestones: ProjectMilestone[] = []
): ProjectProgressMetrics {
  if (project.status === 'COMPLETED') {
    return {
      completionPercentage: 100,
      totalMilestones: milestones.length,
      completedMilestones: milestones.length,
      totalTasks: 0,
      completedTasks: 0,
      openTasks: 0,
      currentPhase: 'Completed & Delivered',
    };
  }

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;

  let completionPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  if (project.status === 'IN_PROGRESS' && completionPercentage === 0) {
    completionPercentage = 25; // Base progress indicator for active projects
  }

  const currentPhaseMilestone = milestones.find((m) => m.status !== 'COMPLETED');
  const currentPhase = currentPhaseMilestone ? currentPhaseMilestone.title : 'Implementation Phase';

  return {
    completionPercentage,
    totalMilestones,
    completedMilestones,
    totalTasks: 0,
    completedTasks: 0,
    openTasks: 0,
    currentPhase,
  };
}

export function calculateFinancialSummary(project: Project): ProjectFinancialSummary {
  const budget = project.budget || 0;
  return {
    estimatedBudget: budget,
    amountInvoiced: Math.round(budget * 0.4), // Placeholder billing calculation
    paymentsReceived: Math.round(budget * 0.3), // Placeholder billing calculation
    remainingBalance: Math.round(budget * 0.7),
    currency: project.currency || 'USD',
  };
}

export async function fetchProjectDashboard(id: string): Promise<ProjectDashboardData> {
  const res = await fetch(`/api/projects/${id}/dashboard`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load project dashboard.');
  }
  return res.json();
}

export async function createProjectNote(projectId: string, content: string, isPinned = false): Promise<ProjectNote> {
  const res = await fetch(`/api/projects/${projectId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, isPinned }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create note.');
  }
  const data = await res.json();
  return data.note;
}

export async function updateProjectNote(
  projectId: string,
  noteId: string,
  updates: { content?: string; isPinned?: boolean }
): Promise<ProjectNote> {
  const res = await fetch(`/api/projects/${projectId}/notes?noteId=${noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update note.');
  }
  const data = await res.json();
  return data.note;
}

export async function deleteProjectNote(projectId: string, noteId: string): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/notes?noteId=${noteId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete note.');
  }
}

export async function updateMilestoneStatus(
  projectId: string,
  milestoneId: string,
  status: ProjectMilestoneStatus
): Promise<ProjectMilestone> {
  const res = await fetch(`/api/projects/${projectId}/milestones`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ milestoneId, status }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update milestone status.');
  }
  const data = await res.json();
  return data.milestone;
}

export async function duplicateProject(projectId: string): Promise<Project> {
  const res = await fetch(`/api/projects/${projectId}/duplicate`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to duplicate project.');
  }
  const data = await res.json();
  return data.project;
}
