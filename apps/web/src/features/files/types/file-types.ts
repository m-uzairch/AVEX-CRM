export type FileCategory =
  | 'DOCUMENTS'
  | 'DESIGNS'
  | 'CONTRACTS'
  | 'REPORTS'
  | 'IMAGES'
  | 'DEVELOPMENT'
  | 'DELIVERABLES'
  | 'OTHER';

export type FileViewMode = 'grid' | 'table';

export interface ProjectFolder {
  id: string;
  companyId: string;
  projectId: string;
  name: string;
  parentId?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    files: number;
    children: number;
  };
}

export interface FileVersion {
  id: string;
  fileId: string;
  versionNumber: number;
  fileUrl: string;
  fileSize: number;
  changeNotes?: string | null;
  uploadedById?: string | null;
  createdAt: string;
  uploadedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface ProjectFile {
  id: string;
  companyId: string;
  projectId: string;
  folderId?: string | null;
  name: string;
  originalName: string;
  fileUrl: string;
  fileSize: number; // Bytes
  fileType: string; // MIME or ext
  category: FileCategory;
  isClientVisible: boolean;
  currentVersion: number;
  uploadedById?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  folder?: ProjectFolder | null;
  uploadedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  versions?: FileVersion[];
}

export interface StorageSummary {
  totalBytesUsed: number;
  formattedStorageUsed: string;
  totalFilesCount: number;
  totalFoldersCount: number;
  categoryBreakdown: Record<FileCategory, number>;
}

export interface FileFilterParams {
  projectId: string;
  folderId?: string | 'ROOT' | 'ALL';
  category?: FileCategory | 'ALL';
  isClientVisible?: boolean;
  search?: string;
  sortField?: 'name' | 'fileSize' | 'createdAt' | 'category';
  sortOrder?: 'asc' | 'desc';
}
