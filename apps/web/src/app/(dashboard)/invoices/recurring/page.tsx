import { Metadata } from 'next';
import { RecurringDashboard } from '@/features/recurring-invoices/components/recurring-dashboard';

export const metadata: Metadata = {
  title: 'Recurring Invoices & Automation | AVEX CRM',
  description: 'Manage automated recurring invoice billing schedules, subscriptions, and Monthly Recurring Revenue (MRR).',
};

export default function RecurringInvoicesPage() {
  return <RecurringDashboard />;
}
