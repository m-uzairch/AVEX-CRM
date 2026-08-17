/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReportFilterBar } from './report-filter-bar';
import { ReportExportDialog } from './report-export-dialog';
import { ReportScheduleDialog } from './report-schedule-dialog';
import {
  ReportType,
  ReportFilterState,
  RevenueReportData,
  ExpenseReportData,
  InvoiceReportData,
  PaymentReportData,
  ProfitLossReportData,
  TaxReportData,
  CustomerReportData,
  ProjectReportData,
} from '../types/report-types';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Receipt,
  PieChart,
  Percent,
  Users,
  FolderKanban,
  Loader2,
} from 'lucide-react';

export function ReportDashboard() {
  const [activeTab, setActiveTab] = React.useState<ReportType>('REVENUE');
  const [filters, setFilters] = React.useState<ReportFilterState>({});
  const [isLoading, setIsLoading] = React.useState(true);

  // Dialogs
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);

  // Data State
  const [revenueData, setRevenueData] = React.useState<RevenueReportData | null>(null);
  const [expenseData, setExpenseData] = React.useState<ExpenseReportData | null>(null);
  const [invoiceData, setInvoiceData] = React.useState<InvoiceReportData | null>(null);
  const [paymentData, setPaymentData] = React.useState<PaymentReportData | null>(null);
  const [profitLossData, setProfitLossData] = React.useState<ProfitLossReportData | null>(null);
  const [taxData, setTaxData] = React.useState<TaxReportData | null>(null);
  const [customerData, setCustomerData] = React.useState<CustomerReportData | null>(null);
  const [projectData, setProjectData] = React.useState<ProjectReportData | null>(null);

  const fetchActiveReport = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab.toLowerCase().replace('_', '-');
      const res = await fetch(`/api/reports/${endpoint}`);
      if (res.ok) {
        const data = await res.json();
        switch (activeTab) {
          case 'REVENUE':
            setRevenueData(data.data);
            break;
          case 'EXPENSE':
            setExpenseData(data.data);
            break;
          case 'INVOICE':
            setInvoiceData(data.data);
            break;
          case 'PAYMENT':
            setPaymentData(data.data);
            break;
          case 'PROFIT_LOSS':
            setProfitLossData(data.data);
            break;
          case 'TAX':
            setTaxData(data.data);
            break;
          case 'CUSTOMER':
            setCustomerData(data.data);
            break;
          case 'PROJECT':
            setProjectData(data.data);
            break;
        }
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    fetchActiveReport();
  }, [fetchActiveReport]);

  const tabs: { type: ReportType; label: string; icon: React.ReactNode }[] = [
    { type: 'REVENUE', label: 'Revenue Analysis', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { type: 'EXPENSE', label: 'Expense Analysis', icon: <Receipt className="h-3.5 w-3.5" /> },
    { type: 'INVOICE', label: 'Invoice Summary', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { type: 'PAYMENT', label: 'Payment Collections', icon: <DollarSign className="h-3.5 w-3.5" /> },
    { type: 'PROFIT_LOSS', label: 'Profit & Loss', icon: <PieChart className="h-3.5 w-3.5" /> },
    { type: 'TAX', label: 'Tax Report', icon: <Percent className="h-3.5 w-3.5" /> },
    { type: 'CUSTOMER', label: 'Customer Financials', icon: <Users className="h-3.5 w-3.5" /> },
    { type: 'PROJECT', label: 'Project Profitability', icon: <FolderKanban className="h-3.5 w-3.5" /> },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'REVENUE':
        return revenueData;
      case 'EXPENSE':
        return expenseData;
      case 'INVOICE':
        return invoiceData;
      case 'PAYMENT':
        return paymentData;
      case 'PROFIT_LOSS':
        return profitLossData;
      case 'TAX':
        return taxData;
      case 'CUSTOMER':
        return customerData;
      case 'PROJECT':
        return projectData;
    }
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Financial Reports & Executive Analytics"
        description="Comprehensive financial reporting engine providing real-time visibility into revenue streams, expenses, margins, cash collections, tax obligations, and project profitability."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Financial Reports' }]}
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleOpen(true)}
              className="h-9 px-3 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Report</span>
            </Button>

            <Button size="sm" onClick={() => setIsExportOpen(true)} className="h-9 px-3 text-xs gap-1.5 bg-primary">
              <Download className="h-3.5 w-3.5" />
              <span>Export & Print</span>
            </Button>
          </div>
        }
      />

      {/* Report Domain Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border/60 pb-2 mt-4 print:hidden">
        {tabs.map((t) => (
          <button
            key={t.type}
            onClick={() => setActiveTab(t.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === t.type
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="mt-3 print:hidden">
        <ReportFilterBar
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={() => setFilters({})}
        />
      </div>

      {/* Main Report View */}
      <div className="mt-4 space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground text-xs">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Generating financial analytics report...
          </div>
        ) : (
          <>
            {/* 1. REVENUE REPORT */}
            {activeTab === 'REVENUE' && revenueData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">TOTAL REVENUE</span>
                      <span className="text-xl font-bold font-mono text-primary">
                        ${revenueData.totalRevenue.toLocaleString()} USD
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">GROWTH RATE</span>
                      <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        +{revenueData.growthPercentage}%
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">AVG INVOICE VALUE</span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        ${revenueData.averageInvoiceValue.toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">TOTAL INVOICES</span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        {revenueData.totalInvoicesCount}
                      </span>
                    </CardContent>
                  </Card>
                </div>

                <div className="border border-border/50 rounded-lg bg-card p-4 space-y-3">
                  <h4 className="font-semibold text-xs text-foreground">Monthly Revenue Trends</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase">
                        <tr>
                          <th className="p-2.5">Period</th>
                          <th className="p-2.5">Invoices Count</th>
                          <th className="p-2.5 text-right">Revenue Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {revenueData.trends.map((t, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="p-2.5 font-medium">{t.period}</td>
                            <td className="p-2.5 font-mono">{t.invoicesCount}</td>
                            <td className="p-2.5 font-mono font-bold text-right text-primary">
                              ${t.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. EXPENSE REPORT */}
            {activeTab === 'EXPENSE' && expenseData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">TOTAL EXPENSES</span>
                      <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                        ${expenseData.totalExpenses.toLocaleString()} USD
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">AVG MONTHLY EXPENSE</span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        ${expenseData.averageMonthlyExpenses.toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50 col-span-2">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">HIGHEST CATEGORY</span>
                      <span className="text-base font-bold text-foreground block">
                        {expenseData.highestCategoryName}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        ${expenseData.highestCategoryAmount.toLocaleString()} USD
                      </span>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border/50 rounded-lg bg-card p-4 space-y-3">
                    <h4 className="font-semibold text-xs text-foreground">Expenses by Category</h4>
                    <div className="space-y-2">
                      {expenseData.categories.map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/20 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                            <span className="font-medium text-foreground">{c.category}</span>
                          </div>
                          <div className="font-mono font-semibold">
                            ${c.amount.toLocaleString()} <span className="text-[10px] text-muted-foreground">({c.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-border/50 rounded-lg bg-card p-4 space-y-3">
                    <h4 className="font-semibold text-xs text-foreground">Expenses by Top Vendors</h4>
                    <div className="space-y-2">
                      {expenseData.vendors.map((v, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted/20 text-xs font-mono">
                          <span>{v.vendorName}</span>
                          <span className="font-bold">${v.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. INVOICE REPORT */}
            {activeTab === 'INVOICE' && invoiceData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-3">
                      <span className="text-[10px] text-muted-foreground font-medium block">PAID INVOICES</span>
                      <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {invoiceData.paidCount}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-3">
                      <span className="text-[10px] text-muted-foreground font-medium block">SENT / PENDING</span>
                      <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                        {invoiceData.sentCount}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-3">
                      <span className="text-[10px] text-muted-foreground font-medium block">OVERDUE</span>
                      <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                        {invoiceData.overdueCount}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-3">
                      <span className="text-[10px] text-muted-foreground font-medium block">DRAFT</span>
                      <span className="text-lg font-bold font-mono text-slate-600 dark:text-slate-400">
                        {invoiceData.draftCount}
                      </span>
                    </CardContent>
                  </Card>
                </div>

                <div className="border border-border/50 rounded-lg bg-card p-4 space-y-3">
                  <h4 className="font-semibold text-xs text-foreground">Financial Summary Totals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-muted/20 p-3 rounded">
                      <span className="text-muted-foreground block text-[10px]">TOTAL BILLED</span>
                      <span className="font-bold text-base font-mono text-foreground">${invoiceData.totalBilledAmount.toLocaleString()}</span>
                    </div>
                    <div className="bg-muted/20 p-3 rounded">
                      <span className="text-muted-foreground block text-[10px]">TOTAL COLLECTED</span>
                      <span className="font-bold text-base font-mono text-emerald-600 dark:text-emerald-400">${invoiceData.totalPaidAmount.toLocaleString()}</span>
                    </div>
                    <div className="bg-muted/20 p-3 rounded">
                      <span className="text-muted-foreground block text-[10px]">OUTSTANDING BALANCE</span>
                      <span className="font-bold text-base font-mono text-rose-600 dark:text-rose-400">${invoiceData.totalOutstandingAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PAYMENT REPORT */}
            {activeTab === 'PAYMENT' && paymentData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">TOTAL PAYMENTS COLLECTED</span>
                      <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        ${paymentData.totalCollected.toLocaleString()} USD
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">COLLECTION RATE</span>
                      <span className="text-xl font-bold font-mono text-primary">
                        {paymentData.collectionRate}%
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">AVG PAYMENT DAYS</span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        {paymentData.averagePaymentDays} Days
                      </span>
                    </CardContent>
                  </Card>
                </div>

                <div className="border border-border/50 rounded-lg bg-card p-4 space-y-3">
                  <h4 className="font-semibold text-xs text-foreground">Payment Methods Breakdown</h4>
                  <div className="space-y-2">
                    {paymentData.methods.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-muted/20 p-2.5 rounded text-xs">
                        <div>
                          <span className="font-medium text-foreground">{m.method}</span>
                          <span className="block text-[10px] text-muted-foreground">{m.count} Transactions</span>
                        </div>
                        <div className="font-mono font-bold">
                          ${m.amount.toLocaleString()} <span className="text-[10px] text-muted-foreground">({m.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. PROFIT & LOSS REPORT */}
            {activeTab === 'PROFIT_LOSS' && profitLossData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">TOTAL REVENUE</span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        ${profitLossData.totalRevenue.toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">TOTAL EXPENSES</span>
                      <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                        -${profitLossData.totalExpenses.toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">NET PROFIT</span>
                      <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        ${profitLossData.netProfit.toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <span className="text-[11px] text-muted-foreground font-medium block">NET PROFIT MARGIN</span>
                      <span className="text-xl font-bold font-mono text-primary">
                        {profitLossData.netMarginPercent}%
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* 6. TAX REPORT */}
            {activeTab === 'TAX' && taxData && (
              <div className="space-y-4">
                <Card className="bg-card border-border/50 max-w-md">
                  <CardContent className="p-4">
                    <span className="text-[11px] text-muted-foreground font-medium block">TOTAL TAX COLLECTED</span>
                    <span className="text-xl font-bold font-mono text-primary">
                      ${taxData.totalTaxCollected.toLocaleString()} USD
                    </span>
                  </CardContent>
                </Card>

                <div className="border border-border/50 rounded-lg bg-card p-4 space-y-3">
                  <h4 className="font-semibold text-xs text-foreground">Tax Rates Breakdown</h4>
                  <div className="space-y-2">
                    {taxData.rates.map((r, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-muted/20 p-2.5 rounded text-xs font-mono">
                        <div>
                          <span className="font-semibold text-foreground">{r.rateName}</span>
                          <span className="block text-[10px] text-muted-foreground">Taxable Base: ${r.taxableAmount.toLocaleString()}</span>
                        </div>
                        <span className="font-bold text-primary">${r.taxAmount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. CUSTOMER FINANCIALS */}
            {activeTab === 'CUSTOMER' && customerData && (
              <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <div className="p-3 bg-muted/30 font-semibold text-xs border-b border-border/40">
                  Customer Revenue Ranking & Balances
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase">
                      <tr>
                        <th className="p-3">Customer Name</th>
                        <th className="p-3">Company</th>
                        <th className="p-3">Invoices</th>
                        <th className="p-3">Total Billed</th>
                        <th className="p-3">Total Paid</th>
                        <th className="p-3 text-right">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {customerData.customers.map((c) => (
                        <tr key={c.customerId} className="hover:bg-muted/20 font-mono">
                          <td className="p-3 font-sans font-medium text-foreground">{c.customerName}</td>
                          <td className="p-3 font-sans text-muted-foreground">{c.companyName}</td>
                          <td className="p-3">{c.invoiceCount}</td>
                          <td className="p-3 font-bold">${c.totalRevenue.toLocaleString()}</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400">${c.totalPaid.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400">
                            ${c.outstandingBalance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. PROJECT PROFITABILITY */}
            {activeTab === 'PROJECT' && projectData && (
              <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <div className="p-3 bg-muted/30 font-semibold text-xs border-b border-border/40">
                  Project Revenue, Budget & Margin Analysis
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase">
                      <tr>
                        <th className="p-3">Project</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Budget</th>
                        <th className="p-3">Revenue</th>
                        <th className="p-3">Expenses</th>
                        <th className="p-3">Profit</th>
                        <th className="p-3 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 font-mono">
                      {projectData.projects.map((p) => (
                        <tr key={p.projectId} className="hover:bg-muted/20">
                          <td className="p-3 font-sans">
                            <span className="font-semibold text-foreground block">{p.projectName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{p.projectCode}</span>
                          </td>
                          <td className="p-3 font-sans">{p.customerName}</td>
                          <td className="p-3">${p.budget.toLocaleString()}</td>
                          <td className="p-3 font-bold text-primary">${p.revenue.toLocaleString()}</td>
                          <td className="p-3 text-rose-600 dark:text-rose-400">${p.expenses.toLocaleString()}</td>
                          <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">${p.profit.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {p.profitMarginPercent}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Export Dialog */}
      <ReportExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType={activeTab}
        data={getCurrentData()}
      />

      {/* Schedule Dialog */}
      <ReportScheduleDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        reportType={activeTab}
      />
    </ContentContainer>
  );
}
