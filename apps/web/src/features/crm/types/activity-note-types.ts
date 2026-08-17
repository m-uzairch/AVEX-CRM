/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NoteAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' | 'JPEG' | 'OTHER';
  fileSize: number; // Bytes
  uploadedAt: string;
}

export interface UserMention {
  userId: string;
  fullName: string;
  email: string;
}

export interface CRMNote {
  id: string;
  entityType: 'CUSTOMER' | 'LEAD' | 'PROJECT' | 'GENERAL';
  entityId: string;
  companyId: string;
  content: string;
  isPinned: boolean;
  attachments?: NoteAttachment[];
  mentions?: UserMention[];
  createdById: string;
  createdBy?: {
    id?: string;
    fullName: string;
    email?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuditFieldDiff {
  field: string;
  label?: string;
  previousValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
}

export interface CRMActivityLog {
  id: string;
  companyId: string;
  userId?: string | null;
  user?: {
    fullName: string;
    email?: string;
    avatar?: string;
  } | null;
  action: string;
  module: string; // 'CRM' | 'CUSTOMERS' | 'LEADS' | 'PROJECTS' | 'INVOICES' | 'MEETINGS' | 'SYSTEM'
  category?: string;
  entityType?: string | null;
  entityId?: string | null;
  entityName?: string | null;
  description: string;
  metadata?: {
    audit?: AuditFieldDiff | AuditFieldDiff[];
    relatedName?: string;
    [key: string]: any;
  } | null;
  timestamp: string;
}

export interface ActivityFilterState {
  search: string;
  module: string;
  action: string;
  userId: string;
  dateRange: 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS' | '90_DAYS';
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}
