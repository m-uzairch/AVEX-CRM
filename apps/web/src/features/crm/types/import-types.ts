import { LeadStatus, LeadPriority } from './lead-types';

export type ImportJobStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PREVIEW_READY'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'FAILED';

export type DuplicateStrategy = 'SKIP' | 'UPDATE' | 'CREATE_NEW';

export interface ParsedLeadRow {
  rowId: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  source?: string;
  industry?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  website?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  score?: number;
  expectedDealValue?: number;
  tags?: string[];
  // Validation status fields
  isValid: boolean;
  validationError?: string;
  isDuplicate: boolean;
  duplicateReason?: string;
  duplicateMatchId?: string;
  duplicateStrategy?: DuplicateStrategy;
}

export interface FieldMappingItem {
  fileColumn: string;
  crmField: string; // 'name' | 'companyName' | 'email' | 'phone' | 'source' | 'industry' | 'country' | etc.
  confidence?: number;
}

export interface ImportJob {
  id: string;
  companyId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: ImportJobStatus;
  totalRecords: number;
  successCount: number;
  duplicateCount: number;
  failedCount: number;
  createdById?: string | null;
  extractedData?: ParsedLeadRow[];
  fieldMapping?: FieldMappingItem[];
  errorLog?: Array<{
    rowId: string;
    rowNumber?: number;
    name?: string;
    email?: string;
    error: string;
    suggestedFix?: string;
  }>;
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExecuteImportPayload {
  jobId: string;
  rows: ParsedLeadRow[];
  duplicateStrategy: DuplicateStrategy;
  assignedEmployeeId?: string;
  defaultStatus?: LeadStatus;
  defaultPriority?: LeadPriority;
  defaultSource?: string;
  tags?: string[];
}
