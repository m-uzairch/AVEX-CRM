import { Metadata } from 'next';
import { AnnouncementsPageContent } from '@/features/communication/components/announcements-page-content';

export const metadata: Metadata = {
  title: 'Announcements | AVEX CRM',
  description: 'Company-wide, team, and project announcements for AVEX CRM workspace.',
};

export default function AnnouncementsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <AnnouncementsPageContent />
    </div>
  );
}
