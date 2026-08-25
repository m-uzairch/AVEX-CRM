import { AIAutomationsHub } from '@/features/ai/components/ai-automations-hub';

export const metadata = {
  title: 'AI Automations & Workflows | AVEX CRM',
  description: 'Controlled AI automation engine for CRM follow-ups, payment reminders, and project scheduling.',
};

export default function AutomationsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <AIAutomationsHub />
    </div>
  );
}
