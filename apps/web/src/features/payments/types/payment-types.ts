/* eslint-disable @typescript-eslint/no-explicit-any */

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CHEQUE'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'MOBILE_WALLET'
  | 'OTHER';

export interface PaymentFormValues {
  invoiceId: string;
  customerId?: string;
  projectId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  internalNotes?: string;
}

export interface PaymentRecord {
  id: string;
  companyId: string;
  invoiceId: string;
  customerId?: string | null;
  projectId?: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  deletedAt?: string | null;
  recordedById?: string | null;
  recordedByName?: string;
  createdAt: string;
  updatedAt: string;

  invoice?: {
    id: string;
    invoiceNumber: string;
    grandTotal: number;
    amountPaid: number;
    remainingBalance: number;
    status: string;
    dueDate: string;
  };
  customer?: {
    id: string;
    name: string;
    companyName: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    projectCode: string;
  } | null;
}

export interface PaymentFilterState {
  search?: string;
  paymentMethod?: string;
  customerId?: string;
  projectId?: string;
  invoiceId?: string;
}

export interface PaymentKPISummary {
  totalCollected: number;
  totalOutstanding: number;
  overdueAmount: number;
  totalPaymentsCount: number;
  openInvoicesCount: number;
  overdueInvoicesCount: number;
}

export interface OutstandingInvoiceItem {
  id: string;
  invoiceNumber: string;
  companyId: string;
  customerId: string;
  customerName: string;
  customerCompanyName: string;
  projectId?: string | null;
  projectName?: string | null;
  invoiceDate: string;
  dueDate: string;
  grandTotal: number;
  amountPaid: number;
  remainingBalance: number;
  percentagePaid: number;
  status: string;
  daysRemainingOrOverdue: number; // positive = days remaining, negative = days overdue
  isOverdue: boolean;
}

export interface CustomerPaymentSummary {
  customerId: string;
  customerName: string;
  companyName: string;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  overdueAmount: number;
  recentPayments: PaymentRecord[];
}

export interface ProjectPaymentSummary {
  projectId: string;
  projectName: string;
  projectCode: string;
  totalProjectValue: number;
  amountReceived: number;
  remainingBalance: number;
  percentagePaid: number;
  linkedInvoicesCount: number;
}
