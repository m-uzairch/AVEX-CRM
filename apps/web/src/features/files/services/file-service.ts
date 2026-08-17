import {
  ProjectFile,
  ProjectFolder,
  FileVersion,
  StorageSummary,
  FileFilterParams,
  FileCategory,
} from '../types/file-types';

export async function fetchProjectFiles(params: FileFilterParams): Promise<{
  folders: ProjectFolder[];
  files: ProjectFile[];
  storageSummary: StorageSummary;
}> {
  const query = new URLSearchParams();
  query.append('projectId', params.projectId);
  if (params.folderId) query.append('folderId', params.folderId);
  if (params.category && params.category !== 'ALL') query.append('category', params.category);
  if (params.isClientVisible !== undefined) query.append('isClientVisible', String(params.isClientVisible));
  if (params.search) query.append('search', params.search);
  if (params.sortField) query.append('sortField', params.sortField);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const res = await fetch(`/api/files?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch project files.');
  }
  return res.json();
}

export async function createFolder(
  projectId: string,
  name: string,
  parentId?: string | null
): Promise<ProjectFolder> {
  const res = await fetch('/api/files/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, name, parentId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create folder.');
  }
  const data = await res.json();
  return data.folder;
}

export async function uploadProjectFile(payload: {
  projectId: string;
  folderId?: string | null;
  name: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  category?: FileCategory;
  isClientVisible?: boolean;
}): Promise<ProjectFile> {
  const res = await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to register file.');
  }
  const data = await res.json();
  return data.file;
}

export async function updateFileMetadata(
  fileId: string,
  updates: {
    name?: string;
    folderId?: string | null;
    category?: FileCategory;
    isClientVisible?: boolean;
  }
): Promise<ProjectFile> {
  const res = await fetch(`/api/files/${fileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update file metadata.');
  }
  const data = await res.json();
  return data.file;
}

export async function uploadFileVersion(
  fileId: string,
  payload: {
    fileUrl: string;
    fileSize: number;
    changeNotes?: string;
  }
): Promise<FileVersion> {
  const res = await fetch(`/api/files/${fileId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload new version.');
  }
  const data = await res.json();
  return data.version;
}

export async function deleteProjectFile(fileId: string): Promise<void> {
  const res = await fetch(`/api/files/${fileId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete file.');
  }
}

export async function deleteProjectFolder(folderId: string): Promise<void> {
  const res = await fetch(`/api/files/folders?folderId=${folderId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete folder.');
  }
}
