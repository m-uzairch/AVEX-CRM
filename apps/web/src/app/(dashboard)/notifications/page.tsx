import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { EmptyState } from '@/components/ui/empty-state';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Notification Center"
        description="View system alerts, task assignments, customer messages, and workflow updates."
        breadcrumbs={[{ label: 'Notifications' }]}
      />
      <EmptyState
        icon={<Bell className="h-6 w-6" />}
        title="Notifications Center Ready"
        description="Real-time notification engine will be enabled during the dedicated Notifications sprint task."
      />
    </ContentContainer>
  );
}
