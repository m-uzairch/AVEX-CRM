/* eslint-disable @typescript-eslint/no-explicit-any */

export type ReportType =
  | 'REVENUE'
  | 'EXPENSE'
  | 'INVOICE'
  | 'PAYMENT'
  | 'PROFIT_LOSS'
  | 'TAX'
  | 'CUSTOMER'
  | 'PROJECT';

export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface ReportFilterState {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  projectId?: string;
  categoryId?: string;
  vendorId?: string;
  employeeId?: string;
  status?: string;
  paymentMethod?: string;
}

export interface RevenueTrendItem {
  period: string; // e.g. "2026-08-01" or "Aug 2026"
  revenue: number;
  invoicesCount: number;
}

export interface RevenueReportData {
  totalRevenue: number;
  growthPercentage: number;
  averageInvoiceValue: number;
  totalInvoicesCount: number;
  trends: RevenueTrendItem[];
}

export interface ExpenseCategoryBreakdown {
  category: string;
  color?: string;
  amount: number;
  percentage: number;
}

export interface ExpenseReportData {
  totalExpenses: number;
  averageMonthlyExpenses: number;
  highestCategoryName: string;
  highestCategoryAmount: number;
  categories: ExpenseCategoryBreakdown[];
  vendors: { vendorName: string; amount: number }[];
}

export interface InvoiceReportData {
  totalInvoicesCount: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
  cancelledCount: number;
  totalBilledAmount: number;
  totalPaidAmount: number;
  totalOutstandingAmount: number;
  averagePaymentDays: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface PaymentReportData {
  totalCollected: number;
  collectionRate: number; // e.g. 85.5%
  averagePaymentDays: number;
  totalOutstanding: number;
  methods: PaymentMethodBreakdown[];
}

export interface ProfitLossReportData {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  netMarginPercent: number; // e.g. 35.4%
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
}

export interface TaxRateBreakdown {
  rateName: string;
  ratePercent: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface TaxReportData {
  totalTaxCollected: number;
  totalTaxableAmount: number;
  rates: TaxRateBreakdown[];
}

export interface CustomerFinancialSummary {
  customerId: string;
  customerName: string;
  companyName: string;
  totalRevenue: number;
  totalPaid: number;
  outstandingBalance: number;
  invoiceCount: number;
  averageInvoiceValue: number;
}

export interface CustomerReportData {
  customers: CustomerFinancialSummary[];
}

export interface ProjectFinancialSummary {
  projectId: string;
  projectCode: string;
  projectName: string;
  customerName: string;
  budget: number;
  revenue: number;
  expenses: number;
  profit: number;
  profitMarginPercent: number;
  isOverBudget: boolean;
}

export interface ProjectReportData {
  projects: ProjectFinancialSummary[];
}

export interface SavedReport {
  id: string;
  companyId: string;
  title: string;
  reportType: ReportType;
  description?: string | null;
  filters?: ReportFilterState | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledReport {
  id: string;
  companyId: string;
  title: string;
  reportType: ReportType;
  frequency: ScheduleFrequency;
  deliveryMethod: string;
  recipients: string[];
  filters?: ReportFilterState | null;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  status: string;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}
