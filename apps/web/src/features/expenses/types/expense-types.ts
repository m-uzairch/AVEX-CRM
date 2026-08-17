/* eslint-disable @typescript-eslint/no-explicit-any */

export type ExpenseStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CANCELLED';

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CHEQUE'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'MOBILE_WALLET'
  | 'OTHER';

export interface ExpenseCategory {
  id: string;
  companyId: string;
  name: string;
  isBuiltIn: boolean;
  color: string;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormValues {
  title: string;
  description?: string;
  categoryId: string;
  amount: number;
  expenseDate: string;
  vendorId?: string;
  projectId?: string;
  employeeId?: string;
  paymentMethod: PaymentMethod;
  status?: ExpenseStatus;
  receiptUrl?: string;
  receiptName?: string;
  receiptSize?: number;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  companyId: string;
  title: string;
  description?: string | null;
  categoryId: string;
  amount: number;
  expenseDate: string;
  vendorId?: string | null;
  projectId?: string | null;
  employeeId?: string | null;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  receiptUrl?: string | null;
  receiptName?: string | null;
  receiptSize?: number | null;
  notes?: string | null;
  reviewedById?: string | null;
  reviewedByName?: string;
  reviewedAt?: string | null;
  approvalNotes?: string | null;
  deletedAt?: string | null;
  createdById?: string | null;
  createdByName?: string;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;

  category?: ExpenseCategory;
  vendor?: Vendor | null;
  project?: {
    id: string;
    name: string;
    projectCode: string;
    budget?: number;
  } | null;
  employee?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface ExpenseFilterState {
  search?: string;
  categoryId?: string;
  status?: string;
  vendorId?: string;
  projectId?: string;
  employeeId?: string;
}

export interface ExpenseKPISummary {
  totalExpenses: number;
  monthlyExpenses: number;
  pendingApprovalsCount: number;
  pendingApprovalsValue: number;
  approvedCount: number;
  approvedValue: number;
  rejectedCount: number;
  projectExpensesValue: number;
}

export interface ProjectBudgetImpact {
  projectId: string;
  projectName: string;
  projectCode: string;
  budget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageSpent: number;
  isOverBudget: boolean;
  expenses: ExpenseRecord[];
}
