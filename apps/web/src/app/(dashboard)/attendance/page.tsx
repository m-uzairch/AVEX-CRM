import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock } from 'lucide-react';

export default function AttendancePage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Attendance & Shifts"
        description="Monitor daily clock-ins, leave requests, shift schedules, and working hours."
        breadcrumbs={[{ label: 'Attendance' }]}
      />
      <EmptyState
        icon={<Clock className="h-6 w-6" />}
        title="Attendance Module Foundation Ready"
        description="Attendance tracking features will be enabled during the dedicated Attendance sprint task."
      />
    </ContentContainer>
  );
}
