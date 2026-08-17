import {
  Task,
  TaskFilterParams,
  PaginatedTasksResponse,
  Subtask,
  TaskComment,
  TimeEntry,
} from '../types/task-types';
import { TaskFormValues } from '../schemas/task-schemas';

export async function fetchTasks(
  params: TaskFilterParams = {}
): Promise<PaginatedTasksResponse> {
  const query = new URLSearchParams();
  if (params.projectId) query.append('projectId', params.projectId);
  if (params.customerId) query.append('customerId', params.customerId);
  if (params.assigneeId) query.append('assigneeId', params.assigneeId);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('pageSize', String(params.pageSize));
  if (params.sortField) query.append('sortField', params.sortField);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const res = await fetch(`/api/tasks?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch tasks.');
  }
  return res.json();
}

export async function fetchTaskById(id: string): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch task details.');
  }
  const data = await res.json();
  return data.task;
}

export async function createTask(values: TaskFormValues): Promise<Task> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create task.');
  }
  const data = await res.json();
  return data.task;
}

export async function updateTask(id: string, values: Partial<TaskFormValues>): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update task.');
  }
  const data = await res.json();
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete task.');
  }
}

export async function addSubtask(taskId: string, title: string): Promise<Subtask> {
  const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add subtask.');
  }
  const data = await res.json();
  return data.subtask;
}

export async function toggleSubtask(taskId: string, subtaskId: string, isCompleted: boolean): Promise<Subtask> {
  const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtaskId, isCompleted }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update subtask.');
  }
  const data = await res.json();
  return data.subtask;
}

export async function addTaskComment(taskId: string, content: string): Promise<TaskComment> {
  const res = await fetch(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add comment.');
  }
  const data = await res.json();
  return data.comment;
}

export async function startTaskTimer(taskId: string): Promise<TimeEntry> {
  const res = await fetch(`/api/tasks/${taskId}/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'START' }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to start task timer.');
  }
  const data = await res.json();
  return data.timeEntry;
}

export async function stopTaskTimer(taskId: string, timeEntryId?: string): Promise<{ totalTimeSpent: number }> {
  const res = await fetch(`/api/tasks/${taskId}/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'STOP', timeEntryId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to stop task timer.');
  }
  return res.json();
}
