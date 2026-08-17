/* eslint-disable @typescript-eslint/no-explicit-any */

export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface InvoiceItemInput {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
  lineTotal?: number;
  sortOrder?: number;
}

export interface InvoiceFormValues {
  customerId: string;
  projectId?: string;
  salesRepId?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  status: InvoiceStatus;
  notes?: string;
  termsConditions?: string;
  items: InvoiceItemInput[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  taxRate: number;
  lineTotal: number;
  sortOrder: number;
  createdAt: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  companyId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
  recordedById?: string | null;
  recordedByName?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId: string;
  projectId?: string | null;
  salesRepId?: string | null;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  remainingBalance: number;
  notes?: string | null;
  termsConditions?: string | null;
  sentAt?: string | null;
  viewedAt?: string | null;
  paidAt?: string | null;
  deletedAt?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;

  customer?: {
    id: string;
    name: string;
    companyName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  project?: {
    id: string;
    projectCode: string;
    name: string;
  } | null;
  salesRep?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
}

export interface InvoiceFilterState {
  search?: string;
  status?: string;
  customerId?: string;
  projectId?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}

export interface InvoiceKPISummary {
  totalInvoicesCount: number;
  totalBilledRevenue: number;
  totalPaidAmount: number;
  totalOutstandingBalance: number;
  overdueAmount: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
}
