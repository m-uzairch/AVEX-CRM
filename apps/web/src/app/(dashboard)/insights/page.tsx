import { SmartInsightsHub } from '@/features/ai/components/smart-insights-hub';

export const metadata = {
  title: 'Smart Insights & Recommendations | AVEX CRM',
  description: 'Proactive AI-powered business insights, financial risk tracking, and pipeline recommendations.',
};

export default function InsightsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <SmartInsightsHub />
    </div>
  );
}
