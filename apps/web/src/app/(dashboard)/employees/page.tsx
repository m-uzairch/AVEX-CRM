import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { EmptyState } from '@/components/ui/empty-state';
import { UserCheck } from 'lucide-react';

export default function EmployeesPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Employee Directory"
        description="Manage employee records, department structures, roles, and profiles."
        breadcrumbs={[{ label: 'Employees' }]}
      />
      <EmptyState
        icon={<UserCheck className="h-6 w-6" />}
        title="Employee Directory Foundation Ready"
        description="Employee management features will be enabled during the dedicated HR & Employee sprint task."
      />
    </ContentContainer>
  );
}
