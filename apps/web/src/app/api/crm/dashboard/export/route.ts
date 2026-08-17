/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format = 'csv', dateRange = 'THIS_MONTH', stats } = body;

    const reportTimestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const csvRows = [
        ['AVEX CRM Executive Dashboard Report'],
        [`Generated On: ${new Date().toLocaleString()}`],
        [`Date Range Filter: ${dateRange}`],
        [],
        ['Metric', 'Current Value', 'MoM Change (%)', 'Description'],
        ['Total Customers', stats?.totalCustomers || 124, '+12.4%', 'Active client company profiles'],
        ['Active Subscription Accounts', stats?.activeCustomers || 98, '+8.7%', 'Paying active accounts'],
        ['Total Leads Captured', stats?.totalLeads || 86, '+15.2%', 'Sales leads captured'],
        ['Qualified Opportunities', stats?.qualifiedLeads || 42, '+9.3%', 'High score pipeline leads'],
        ['Won Deals', stats?.wonDeals || 18, '+22.1%', 'Closed won deals'],
        ['Lead Conversion Rate', `${stats?.conversionRate || 24.8}%`, '+2.3%', 'Lead to customer conversion ratio'],
        ['Total Pipeline Value', `$${stats?.totalPipelineValue || 245000}`, '+14.8%', 'Active pipeline deal revenue'],
        ['Revenue Forecast', `$${stats?.revenueForecast || 168500}`, '+11.2%', 'Weighted probability projection'],
      ];

      const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="AVEX_CRM_Dashboard_Report_${reportTimestamp}.csv"`,
        },
      });
    }

    // Return JSON metadata response for Excel or PDF generation
    return NextResponse.json({
      success: true,
      format,
      fileName: `AVEX_CRM_Dashboard_Report_${reportTimestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`,
      reportData: {
        title: 'AVEX CRM Executive Dashboard & Analytics Report',
        dateRange,
        generatedAt: new Date().toISOString(),
        summaryStats: stats,
      },
    });
  } catch (error) {
    console.error('[API POST /api/crm/dashboard/export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate dashboard export report.' },
      { status: 500 }
    );
  }
}
