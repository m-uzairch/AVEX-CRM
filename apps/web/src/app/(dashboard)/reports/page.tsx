import { Metadata } from 'next';
import { ReportDashboard } from '@/features/reports/components/report-dashboard';

export const metadata: Metadata = {
  title: 'Financial Reports & Analytics | AVEX CRM',
  description: 'Executive financial reports, revenue analysis, expense breakdowns, P&L statements, tax summaries, and project profitability.',
};

export default function ReportsPage() {
  return <ReportDashboard />;
}
