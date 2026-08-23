/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientProjectPhase, ClientProjectTask } from '../types/portal-types';

/**
 * Formats database milestones into structured client-safe project phases,
 * identifying the currently active phase.
 */
export function formatClientPhases(milestones: any[] = []): ClientProjectPhase[] {
  if (!milestones || milestones.length === 0) {
    return [];
  }

  const sorted = [...milestones].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  // Identify the first non-completed milestone as the current phase
  let currentFound = false;

  return sorted.map((m) => {
    const isCompleted = m.status === 'COMPLETED';
    let isCurrent = false;

    if (!currentFound && !isCompleted && m.status !== 'CANCELLED') {
      isCurrent = true;
      currentFound = true;
    }

    return {
      id: m.id,
      title: m.title,
      description: m.description || null,
      order: m.order ?? 0,
      status: m.status,
      progressPercentage: m.progressPercentage ?? (isCompleted ? 100 : m.status === 'IN_PROGRESS' ? 50 : 0),
      startDate: m.startDate ? (m.startDate instanceof Date ? m.startDate.toISOString() : String(m.startDate)) : null,
      dueDate: m.dueDate ? (m.dueDate instanceof Date ? m.dueDate.toISOString() : String(m.dueDate)) : null,
      completionDate: m.completionDate ? (m.completionDate instanceof Date ? m.completionDate.toISOString() : String(m.completionDate)) : null,
      isCurrent,
    };
  });
}

/**
 * Sanitizes project tasks to expose only client-safe task fields.
 * Strictly excludes internal employee notes, private comments, and time entries.
 */
export function sanitizeClientTasks(tasks: any[] = []): ClientProjectTask[] {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  const now = new Date();

  return tasks
    .filter((t) => !t.deletedAt)
    .map((t) => {
      const dueDateObj = t.dueDate ? (t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate)) : null;
      const isOverdue = dueDateObj ? dueDateObj < now && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' : false;
      const labels = Array.isArray(t.labels) ? t.labels : [];
      
      const requiresClientAction =
        t.status === 'REVIEW' ||
        labels.some(
          (l: string) =>
            l.toLowerCase().includes('client') ||
            l.toLowerCase().includes('approval') ||
            l.toLowerCase().includes('feedback') ||
            l.toLowerCase().includes('review')
        );

      return {
        id: t.id,
        title: t.title,
        description: t.description || null,
        status: t.status,
        priority: t.priority,
        dueDate: dueDateObj ? dueDateObj.toISOString() : null,
        isOverdue,
        requiresClientAction,
        labels,
        createdAt: t.createdAt
          ? t.createdAt instanceof Date
            ? t.createdAt.toISOString()
            : String(t.createdAt)
          : new Date().toISOString(),
      };
    });
}

/**
 * Calculates high-level task metrics and progress percentage for the client portal.
 */
export function calculateClientTaskStats(
  project: any,
  milestones: any[] = [],
  tasks: any[] = []
) {
  const sanitized = sanitizeClientTasks(tasks);
  const totalTasks = sanitized.length;
  const completedTasks = sanitized.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = sanitized.filter((t) => t.status === 'IN_PROGRESS').length;
  const attentionRequiredTasks = sanitized.filter((t) => t.requiresClientAction || t.status === 'REVIEW').length;
  const remainingTasks = sanitized.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;

  let completionPercentage = 0;
  if (project.status === 'COMPLETED') {
    completionPercentage = 100;
  } else if (totalTasks > 0) {
    completionPercentage = Math.round((completedTasks / totalTasks) * 100);
  } else if (milestones.length > 0) {
    const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
    completionPercentage = Math.round((completedMilestones / milestones.length) * 100);
  } else if (project.status === 'IN_PROGRESS') {
    completionPercentage = 25;
  }

  const currentPhaseMilestone = milestones.find((m) => m.status !== 'COMPLETED');
  const currentPhase = currentPhaseMilestone ? currentPhaseMilestone.title : (project.status === 'COMPLETED' ? 'Completed & Delivered' : 'Implementation Phase');

  return {
    completionPercentage,
    totalTasks,
    completedTasks,
    remainingTasks,
    inProgressTasks,
    attentionRequiredTasks,
    currentStatus: project.status,
    currentPhase,
  };
}

/**
 * Resolves the next important step for the client based on real project,
 * milestone, and task data.
 */
export function resolveProjectNextStep(
  project: any,
  milestones: any[] = [],
  tasks: any[] = []
): string {
  if (project.status === 'COMPLETED') {
    return 'Project deliverables have been completed and approved.';
  }

  if (project.status === 'CANCELLED') {
    return 'Project has been closed or cancelled.';
  }

  if (project.status === 'ON_HOLD') {
    return 'Project is on hold pending client review or requirement clarification.';
  }

  if (project.status === 'PLANNING') {
    return 'Finalizing project scope, deliverable milestones, and team kick-off.';
  }

  if (project.status === 'REVIEW') {
    return 'Deliverables are ready for client inspection and sign-off.';
  }

  // Check active milestones
  const activeMilestone = milestones.find(
    (m) => m.status === 'IN_PROGRESS' || m.status === 'PLANNING' || m.status === 'NOT_STARTED'
  );

  // Check upcoming incomplete tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const nextTask = pendingTasks.find((t) => t.dueDate) || pendingTasks[0];

  if (activeMilestone && nextTask) {
    const dueStr = nextTask.dueDate
      ? ` (Target: ${new Date(nextTask.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
      : '';
    return `Phase "${activeMilestone.title}": Complete ${nextTask.title}${dueStr}`;
  }

  if (activeMilestone) {
    return `Currently advancing deliverables for phase: "${activeMilestone.title}".`;
  }

  if (nextTask) {
    return `Upcoming milestone deliverable: "${nextTask.title}".`;
  }

  return 'Development and implementation underway according to project schedule.';
}
