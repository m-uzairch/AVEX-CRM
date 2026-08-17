import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { EmptyState } from '@/components/ui/empty-state';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Company & System Settings"
        description="Configure workspace preferences, company profile, branding, roles, and module settings."
        breadcrumbs={[{ label: 'Settings' }]}
      />
      <EmptyState
        icon={<Settings className="h-6 w-6" />}
        title="Settings Workspace Ready"
        description="Company configuration and settings will be enabled during the dedicated Admin & Settings sprint task."
      />
    </ContentContainer>
  );
}
