import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Calendar & Scheduling"
        description="Schedule team meetings, client appointments, project deadlines, and company events."
        breadcrumbs={[{ label: 'Calendar' }]}
      />
      <EmptyState
        icon={<Calendar className="h-6 w-6" />}
        title="Calendar Module Foundation Ready"
        description="Calendar integration features will be enabled during the dedicated Scheduling sprint task."
      />
    </ContentContainer>
  );
}
