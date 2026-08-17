import { Metadata } from 'next';
import { TaxDashboard } from '@/features/taxes/components/tax-dashboard';

export const metadata: Metadata = {
  title: 'Tax & Discount Management | AVEX CRM',
  description: 'Manage tax rates, tax templates, discount rules, and financial calculation preferences for AVEX CRM.',
};

export default function TaxesPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <TaxDashboard />
    </div>
  );
}
