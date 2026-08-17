/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { FinancialDashboardService } from '@/features/financial-dashboard/services/financial-dashboard-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const format = body.format || 'json'; // json, csv
    const dateRange = body.dateRange || 'THIS_YEAR';

    const summary = await FinancialDashboardService.getFinancialSummary(companyId, dateRange);

    if (format === 'csv') {
      const csvRows = [
        ['Metric', 'Value ($ / Count)'],
        ['Total Revenue', summary.kpis.totalRevenue],
        ['Total Expenses', summary.kpis.totalExpenses],
        ['Net Profit', summary.kpis.netProfit],
        ['Net Profit Margin %', `${summary.kpis.netProfitMargin}%`],
        ['Outstanding Balance', summary.kpis.outstandingBalance],
        ['Overdue Amount', summary.kpis.overdueAmount],
        ['Active Invoices Count', summary.kpis.activeInvoicesCount],
        ['Overdue Invoices Count', summary.kpis.overdueInvoicesCount],
        ['Average Invoice Value', summary.kpis.averageInvoiceValue],
      ];

      const csvString = csvRows.map((r) => r.join(',')).join('\n');

      return new NextResponse(csvString, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial_summary_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ summary, exportedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('[API POST /api/financial-dashboard/export] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to export financial summary.' },
      { status: 500 }
    );
  }
}
