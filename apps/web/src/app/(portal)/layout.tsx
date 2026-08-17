import * as React from 'react';
import { PortalLayoutClient } from '@/features/portal/components/portal-layout-client';

export const metadata = {
  title: 'AVEX CRM - Client Portal',
  description: 'Secure Client Workspace & Project Progress Tracker',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
