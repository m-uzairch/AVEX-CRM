/* eslint-disable @typescript-eslint/no-explicit-any */

export type BillingFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'BI_WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUALLY'
  | 'YEARLY'
  | 'CUSTOM';

export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED';

export interface RecurringInvoiceItemInput {
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

export interface RecurringInvoiceItem {
  id: string;
  recurringInvoiceId: string;
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

export interface RecurringInvoiceHistory {
  id: string;
  recurringInvoiceId: string;
  generatedInvoiceId?: string | null;
  invoiceNumber: string;
  amount: number;
  status: string;
  generatedAt: string;
}

export interface RecurringInvoiceFormValues {
  templateName: string;
  customerId: string;
  projectId?: string;
  billingStartDate: string;
  billingEndDate?: string;
  frequency: BillingFrequency;
  customIntervalDays?: number;
  totalCycles?: number;
  currency?: string;
  notes?: string;
  termsConditions?: string;
  items: RecurringInvoiceItemInput[];
}

export interface RecurringInvoice {
  id: string;
  companyId: string;
  templateName: string;
  customerId: string;
  projectId?: string | null;
  billingStartDate: string;
  billingEndDate?: string | null;
  frequency: BillingFrequency;
  customIntervalDays?: number | null;
  nextBillingDate: string;
  lastInvoiceDate?: string | null;
  totalCycles?: number | null;
  remainingCycles?: number | null;
  status: RecurringStatus;
  cancellationReason?: string | null;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  notes?: string | null;
  termsConditions?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;

  customer?: {
    id: string;
    name: string;
    companyName: string;
    email: string;
    phone?: string;
  };
  project?: {
    id: string;
    projectCode: string;
    name: string;
  } | null;
  items?: RecurringInvoiceItem[];
  history?: RecurringInvoiceHistory[];
}

export interface RecurringInvoiceFilterState {
  search?: string;
  status?: RecurringStatus | 'ALL';
  frequency?: BillingFrequency | 'ALL';
  customerId?: string;
  projectId?: string;
}

export interface RecurringInvoiceKPISummary {
  totalActiveSubscriptions: number;
  monthlyRecurringRevenue: number; // MRR
  upcomingInvoicesCount: number; // next 7 days
  expiringPlansCount: number;
  totalGeneratedInvoices: number;
  totalRecurringBilledRevenue: number;
}

export interface ProcessRecurringJobsResult {
  processedSchedules: number;
  generatedInvoicesCount: number;
  expiredSchedulesCount: number;
  errors: string[];
}
