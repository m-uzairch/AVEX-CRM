import {
  Project,
  ProjectCategory,
  ProjectFilterParams,
  PaginatedProjectsResponse,
  ProjectStats,
} from '../types/project-types';
import { ProjectFormValues, ProjectCategoryFormValues } from '../schemas/project-schemas';

export async function fetchProjects(
  params: ProjectFilterParams = {}
): Promise<PaginatedProjectsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
  if (params.categoryId && params.categoryId !== 'ALL') query.append('categoryId', params.categoryId);
  if (params.projectManagerId && params.projectManagerId !== 'ALL') query.append('projectManagerId', params.projectManagerId);
  if (params.isArchived !== undefined) query.append('isArchived', String(params.isArchived));
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('pageSize', String(params.pageSize));
  if (params.sortField) query.append('sortField', params.sortField);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const res = await fetch(`/api/projects?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch projects.');
  }
  return res.json();
}

export async function fetchProjectStats(): Promise<ProjectStats> {
  const res = await fetch('/api/projects/stats');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch project stats.');
  }
  return res.json();
}

export async function fetchProjectById(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch project details.');
  }
  const data = await res.json();
  return data.project;
}

export async function createProject(values: ProjectFormValues): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create project.');
  }
  const data = await res.json();
  return data.project;
}

export async function updateProject(id: string, values: Partial<ProjectFormValues>): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update project.');
  }
  const data = await res.json();
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete project.');
  }
}

export async function fetchProjectCategories(): Promise<ProjectCategory[]> {
  const res = await fetch('/api/projects/categories');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch project categories.');
  }
  const data = await res.json();
  return data.categories;
}

export async function createProjectCategory(values: ProjectCategoryFormValues): Promise<ProjectCategory> {
  const res = await fetch('/api/projects/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create project category.');
  }
  const data = await res.json();
  return data.category;
}
