/* eslint-disable @typescript-eslint/no-explicit-any */

export type FinancialDateRange = 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'ALL_TIME';

export interface FinancialOverviewKPIs {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueGrowthMonthOverMonth: number;
  totalExpenses: number;
  expensesThisMonth: number;
  netProfit: number;
  netProfitMargin: number;
  outstandingBalance: number;
  overdueAmount: number;
  activeInvoicesCount: number;
  overdueInvoicesCount: number;
  paidInvoicesCount: number;
  averageInvoiceValue: number;
}

export interface MonthlyRevenueTrendItem {
  month: string; // e.g. 'Jan 2026'
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseCategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface InvoiceStatusAnalyticsItem {
  status: string;
  label: string;
  count: number;
  totalAmount: number;
  color: string;
}

export interface ProjectProfitabilityItem {
  projectId: string;
  projectName: string;
  projectCode: string;
  budget: number;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  isOperatingAtLoss: boolean;
}

export interface TopCustomerRevenueItem {
  customerId: string;
  customerName: string;
  companyName: string;
  lifetimeRevenue: number;
  paidAmount: number;
  outstandingBalance: number;
  invoicesCount: number;
  averageInvoiceValue: number;
}

export interface FinancialActivityItem {
  id: string;
  title: string;
  description: string;
  type: 'INVOICE' | 'PAYMENT' | 'EXPENSE' | 'QUOTATION';
  timestamp: string;
  amount?: number;
}

export interface WidgetPreferences {
  visibleWidgets: string[];
  widgetOrder: string[];
  defaultDateRange: FinancialDateRange;
}

export interface CompleteFinancialSummary {
  kpis: FinancialOverviewKPIs;
  monthlyTrends: MonthlyRevenueTrendItem[];
  expenseCategories: ExpenseCategoryBreakdownItem[];
  invoiceStatuses: InvoiceStatusAnalyticsItem[];
  projectProfitability: ProjectProfitabilityItem[];
  topCustomers: TopCustomerRevenueItem[];
  recentActivities: FinancialActivityItem[];
}
