import { Metadata } from 'next';
import { CommunicationDashboardContent } from '@/features/communication/components/communication-dashboard-content';

export const metadata: Metadata = {
  title: 'Communication Hub | AVEX CRM',
  description: 'Centralized communication, messaging, meetings, and announcements for AVEX CRM.',
};

export default function CommunicationPage() {
  return (
    <div className="p-6 space-y-6">
      <CommunicationDashboardContent />
    </div>
  );
}
