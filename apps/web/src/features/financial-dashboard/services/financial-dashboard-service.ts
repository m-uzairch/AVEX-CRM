/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import {
  CompleteFinancialSummary,
  FinancialOverviewKPIs,
  MonthlyRevenueTrendItem,
  ExpenseCategoryBreakdownItem,
  InvoiceStatusAnalyticsItem,
  ProjectProfitabilityItem,
  TopCustomerRevenueItem,
  FinancialActivityItem,
  WidgetPreferences,
  FinancialDateRange,
} from '../types/financial-dashboard-types';

export class FinancialDashboardService {
  /**
   * Fetch complete financial dashboard summary for company
   */
  static async getFinancialSummary(
    companyId: string = 'comp_001',
    dateRange: FinancialDateRange = 'THIS_YEAR'
  ): Promise<CompleteFinancialSummary> {
    const db = prisma as any;

    const now = new Date();
    let startDate: Date | undefined;

    if (dateRange === 'THIS_MONTH') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'THIS_QUARTER') {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterMonth, 1);
    } else if (dateRange === 'THIS_YEAR') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // 1. Fetch raw data in parallel
    const [payments, invoices, expenses, categories, projects, customers, activityLogs] =
      await Promise.all([
        db.invoicePayment.findMany({
          where: {
            companyId,
            deletedAt: null,
            ...(startDate ? { paymentDate: { gte: startDate } } : {}),
          },
        }),
        db.invoice.findMany({
          where: {
            companyId,
            deletedAt: null,
            ...(startDate ? { invoiceDate: { gte: startDate } } : {}),
          },
          include: { customer: true, project: true },
        }),
        db.expense.findMany({
          where: {
            companyId,
            deletedAt: null,
            ...(startDate ? { expenseDate: { gte: startDate } } : {}),
          },
          include: { category: true, vendor: true, project: true },
        }),
        db.expenseCategory.findMany({ where: { companyId } }),
        db.project.findMany({
          where: { companyId, deletedAt: null },
          include: {
            invoices: { where: { deletedAt: null } },
            expenses: { where: { deletedAt: null, status: { in: ['APPROVED', 'PAID'] } } },
          },
        }),
        db.customer.findMany({
          where: { companyId },
          include: {
            invoices: { where: { deletedAt: null } },
            payments: { where: { deletedAt: null } },
          },
        }),
        db.activityLog.findMany({
          where: { companyId },
          orderBy: { timestamp: 'desc' },
          take: 8,
        }),
      ]);

    // 2. Compute Financial KPIs
    let totalRevenue = 0;
    let revenueThisMonth = 0;
    let revenuePrevMonth = 0;

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    payments.forEach((p: any) => {
      const amt = p.amount || 0;
      totalRevenue += amt;

      const pDate = new Date(p.paymentDate);
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        revenueThisMonth += amt;
      } else if (pDate.getMonth() === prevMonth && pDate.getFullYear() === prevMonthYear) {
        revenuePrevMonth += amt;
      }
    });

    const revenueGrowthMonthOverMonth =
      revenuePrevMonth > 0
        ? Math.round(((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100)
        : 0;

    let totalExpenses = 0;
    let expensesThisMonth = 0;

    expenses.forEach((e: any) => {
      if (e.status === 'APPROVED' || e.status === 'PAID') {
        const amt = e.amount || 0;
        totalExpenses += amt;

        const eDate = new Date(e.expenseDate);
        if (eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear) {
          expensesThisMonth += amt;
        }
      }
    });

    totalRevenue = Math.round(totalRevenue * 100) / 100;
    totalExpenses = Math.round(totalExpenses * 100) / 100;
    const netProfit = Math.round((totalRevenue - totalExpenses) * 100) / 100;
    const netProfitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    let outstandingBalance = 0;
    let overdueAmount = 0;
    let activeInvoicesCount = 0;
    let overdueInvoicesCount = 0;
    let paidInvoicesCount = 0;
    let sumInvoiceTotals = 0;

    invoices.forEach((inv: any) => {
      sumInvoiceTotals += inv.grandTotal || 0;

      if (inv.status === 'PAID') {
        paidInvoicesCount++;
      } else {
        activeInvoicesCount++;
        outstandingBalance += inv.remainingBalance || 0;

        if (new Date(inv.dueDate) < now || inv.status === 'OVERDUE') {
          overdueInvoicesCount++;
          overdueAmount += inv.remainingBalance || 0;
        }
      }
    });

    const averageInvoiceValue =
      invoices.length > 0 ? Math.round((sumInvoiceTotals / invoices.length) * 100) / 100 : 0;

    const kpis: FinancialOverviewKPIs = {
      totalRevenue,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      revenueGrowthMonthOverMonth,
      totalExpenses,
      expensesThisMonth: Math.round(expensesThisMonth * 100) / 100,
      netProfit,
      netProfitMargin,
      outstandingBalance: Math.round(outstandingBalance * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      activeInvoicesCount,
      overdueInvoicesCount,
      paidInvoicesCount,
      averageInvoiceValue,
    };

    // 3. Monthly Revenue & Expense Trends (Last 6 months)
    const monthlyTrends: MonthlyRevenueTrendItem[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear();

      const mMonth = d.getMonth();
      const mYear = d.getFullYear();

      let mRev = 0;
      payments.forEach((p: any) => {
        const pD = new Date(p.paymentDate);
        if (pD.getMonth() === mMonth && pD.getFullYear() === mYear) {
          mRev += p.amount || 0;
        }
      });

      let mExp = 0;
      expenses.forEach((e: any) => {
        if (e.status === 'APPROVED' || e.status === 'PAID') {
          const eD = new Date(e.expenseDate);
          if (eD.getMonth() === mMonth && eD.getFullYear() === mYear) {
            mExp += e.amount || 0;
          }
        }
      });

      monthlyTrends.push({
        month: mLabel,
        revenue: Math.round(mRev * 100) / 100,
        expenses: Math.round(mExp * 100) / 100,
        profit: Math.round((mRev - mExp) * 100) / 100,
      });
    }

    // 4. Expense Category Breakdown
    const catMap = new Map<string, { name: string; color: string; amount: number }>();
    categories.forEach((c: any) => {
      catMap.set(c.id, { name: c.name, color: c.color || '#3B82F6', amount: 0 });
    });

    expenses.forEach((e: any) => {
      if (e.status === 'APPROVED' || e.status === 'PAID') {
        const item = catMap.get(e.categoryId);
        if (item) {
          item.amount += e.amount || 0;
        }
      }
    });

    const expenseCategories: ExpenseCategoryBreakdownItem[] = [];
    catMap.forEach((val, catId) => {
      if (val.amount > 0 || expenseCategories.length < 6) {
        expenseCategories.push({
          categoryId: catId,
          categoryName: val.name,
          color: val.color,
          amount: Math.round(val.amount * 100) / 100,
          percentage: totalExpenses > 0 ? Math.round((val.amount / totalExpenses) * 100) : 0,
        });
      }
    });
    expenseCategories.sort((a, b) => b.amount - a.amount);

    // 5. Invoice Status Analytics
    const statusConfig = [
      { status: 'PAID', label: 'Paid', color: '#10B981' },
      { status: 'PARTIALLY_PAID', label: 'Partially Paid', color: '#3B82F6' },
      { status: 'SENT', label: 'Sent', color: '#8B5CF6' },
      { status: 'OVERDUE', label: 'Overdue', color: '#EF4444' },
      { status: 'DRAFT', label: 'Draft', color: '#64748B' },
    ];

    const invoiceStatuses: InvoiceStatusAnalyticsItem[] = statusConfig.map((cfg) => {
      let count = 0;
      let totalAmount = 0;

      invoices.forEach((inv: any) => {
        if (inv.status === cfg.status) {
          count++;
          totalAmount += inv.grandTotal || 0;
        }
      });

      return {
        status: cfg.status,
        label: cfg.label,
        count,
        totalAmount: Math.round(totalAmount * 100) / 100,
        color: cfg.color,
      };
    });

    // 6. Project Profitability Analysis
    const projectProfitability: ProjectProfitabilityItem[] = projects.map((p: any) => {
      let projRev = 0;
      (p.invoices || []).forEach((inv: any) => {
        projRev += inv.amountPaid || 0;
      });

      let projExp = 0;
      (p.expenses || []).forEach((exp: any) => {
        projExp += exp.amount || 0;
      });

      projRev = Math.round(projRev * 100) / 100;
      projExp = Math.round(projExp * 100) / 100;
      const profit = Math.round((projRev - projExp) * 100) / 100;
      const profitMargin = projRev > 0 ? Math.round((profit / projRev) * 100) : 0;
      const isOperatingAtLoss = profit < 0;

      return {
        projectId: p.id,
        projectName: p.name,
        projectCode: p.projectCode,
        budget: p.budget || 0,
        revenue: projRev,
        expenses: projExp,
        profit,
        profitMargin,
        isOperatingAtLoss,
      };
    });

    // Sort projects by highest revenue
    projectProfitability.sort((a, b) => b.revenue - a.revenue);

    // 7. Top Customers by Revenue
    const topCustomers: TopCustomerRevenueItem[] = customers.map((c: any) => {
      let lifetimeRevenue = 0;
      (c.payments || []).forEach((pay: any) => {
        lifetimeRevenue += pay.amount || 0;
      });

      let paidAmount = 0;
      let outstandingBalance = 0;
      let sumInvoices = 0;

      (c.invoices || []).forEach((inv: any) => {
        sumInvoices += inv.grandTotal || 0;
        paidAmount += inv.amountPaid || 0;
        outstandingBalance += inv.remainingBalance || 0;
      });

      const invoicesCount = (c.invoices || []).length;
      const averageInvoiceValue =
        invoicesCount > 0 ? Math.round((sumInvoices / invoicesCount) * 100) / 100 : 0;

      return {
        customerId: c.id,
        customerName: c.name,
        companyName: c.companyName,
        lifetimeRevenue: Math.round(lifetimeRevenue * 100) / 100,
        paidAmount: Math.round(paidAmount * 100) / 100,
        outstandingBalance: Math.round(outstandingBalance * 100) / 100,
        invoicesCount,
        averageInvoiceValue,
      };
    });

    topCustomers.sort((a, b) => b.lifetimeRevenue - a.lifetimeRevenue);

    // 8. Recent Financial Activity
    const recentActivities: FinancialActivityItem[] = activityLogs.map((log: any) => ({
      id: log.id,
      title: log.action.replace('_', ' '),
      description: log.description,
      type: log.module === 'FINANCE' ? 'INVOICE' : 'EXPENSE',
      timestamp: log.timestamp.toISOString(),
      amount: log.metadata?.amount || undefined,
    }));

    return {
      kpis,
      monthlyTrends,
      expenseCategories,
      invoiceStatuses,
      projectProfitability: projectProfitability.slice(0, 5),
      topCustomers: topCustomers.slice(0, 5),
      recentActivities,
    };
  }

  /**
   * Get User Widget Preferences
   */
  static async getUserPreferences(
    userId: string = 'usr_001',
    _companyId: string = 'comp_001'
  ): Promise<WidgetPreferences> {
    const db = prisma as any;

    const pref = await db.financialDashboardPreference.findUnique({
      where: { userId },
    });

    const defaultWidgets = [
      'REVENUE_TREND',
      'EXPENSE_BREAKDOWN',
      'INVOICE_ANALYTICS',
      'PROJECT_PROFITABILITY',
      'TOP_CUSTOMERS',
      'RECENT_ACTIVITIES',
    ];

    if (!pref) {
      return {
        visibleWidgets: defaultWidgets,
        widgetOrder: defaultWidgets,
        defaultDateRange: 'THIS_YEAR',
      };
    }

    return {
      visibleWidgets: (pref.visibleWidgets as string[]) || defaultWidgets,
      widgetOrder: (pref.widgetOrder as string[]) || defaultWidgets,
      defaultDateRange: (pref.defaultDateRange as FinancialDateRange) || 'THIS_YEAR',
    };
  }

  /**
   * Save User Widget Preferences
   */
  static async saveUserPreferences(
    userId: string = 'usr_001',
    companyId: string = 'comp_001',
    preferences: Partial<WidgetPreferences>
  ): Promise<WidgetPreferences> {
    const db = prisma as any;

    const upserted = await db.financialDashboardPreference.upsert({
      where: { userId },
      update: {
        visibleWidgets: preferences.visibleWidgets || undefined,
        widgetOrder: preferences.widgetOrder || undefined,
        defaultDateRange: preferences.defaultDateRange || undefined,
      },
      create: {
        companyId,
        userId,
        visibleWidgets: preferences.visibleWidgets || [
          'REVENUE_TREND',
          'EXPENSE_BREAKDOWN',
          'INVOICE_ANALYTICS',
          'PROJECT_PROFITABILITY',
          'TOP_CUSTOMERS',
          'RECENT_ACTIVITIES',
        ],
        widgetOrder: preferences.widgetOrder || [
          'REVENUE_TREND',
          'EXPENSE_BREAKDOWN',
          'INVOICE_ANALYTICS',
          'PROJECT_PROFITABILITY',
          'TOP_CUSTOMERS',
          'RECENT_ACTIVITIES',
        ],
        defaultDateRange: preferences.defaultDateRange || 'THIS_YEAR',
      },
    });

    return {
      visibleWidgets: (upserted.visibleWidgets as string[]) || [],
      widgetOrder: (upserted.widgetOrder as string[]) || [],
      defaultDateRange: (upserted.defaultDateRange as FinancialDateRange) || 'THIS_YEAR',
    };
  }
}
