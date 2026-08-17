export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'LOST' | 'BLACKLISTED' | 'ARCHIVED';

export type CustomerPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Customer {
  id: string;
  companyId: string;
  assignedEmployeeId?: string | null;
  assignedEmployeeName?: string | null;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  alternatePhone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  postalCode?: string | null;
  industry?: string | null;
  businessType?: string | null;
  website?: string | null;
  companySize?: string | null;
  status: CustomerStatus;
  source?: string | null;
  priority: CustomerPriority;
  tags: string[];
  isArchived: boolean;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  industry?: string;
  businessType?: string;
  website?: string;
  companySize?: string;
  status: CustomerStatus;
  source?: string;
  priority: CustomerPriority;
  assignedEmployeeId?: string;
  tags: string[];
}

export interface CustomerNote {
  id: string;
  customerId: string;
  companyId: string;
  content: string;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerActivity {
  id: string;
  customerId: string;
  action: string;
  description: string;
  performedBy?: string;
  timestamp: string;
}

export interface CustomerFilterState {
  search: string;
  status: CustomerStatus | 'ALL';
  industry: string | 'ALL';
  assignedEmployeeId: string | 'ALL';
  source: string | 'ALL';
  tag: string | 'ALL';
  isArchived?: boolean;
  isDeleted?: boolean;
  sortField: 'name' | 'companyName' | 'createdAt' | 'updatedAt' | 'status';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export type BulkActionType =
  | 'DELETE'
  | 'RESTORE'
  | 'ARCHIVE'
  | 'UNARCHIVE'
  | 'CHANGE_STATUS'
  | 'ASSIGN_EMPLOYEE'
  | 'ADD_TAGS'
  | 'REMOVE_TAGS';

export interface BulkActionPayload {
  action: BulkActionType;
  customerIds: string[];
  targetStatus?: CustomerStatus;
  targetEmployeeId?: string;
  tags?: string[];
}

export interface AssignedEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface CustomerProjectItem {
  id: string;
  name: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'PLANNING';
  assignedTeam: string;
  startDate: string;
  dueDate: string;
  progressPercent: number;
}

export interface CustomerInvoiceItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'DRAFT';
}

export interface CustomerFileItem {
  id: string;
  name: string;
  category: 'Contract' | 'Agreement' | 'Quotation' | 'Receipt' | 'Other';
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  fileType: string;
}

export interface CustomerMeetingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'DISCOVERY' | 'REVIEW' | 'SUPPORT' | 'DEMO';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  attendeesCount: number;
}

export interface CustomerSummaryStats {
  totalProjects: number;
  totalInvoices: number;
  totalPaymentsAmount: number;
  openLeads: number;
  lastContactDate: string | null;
}

