'use client';

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { SettingsNav } from '@/features/settings/components/settings-nav';
import { ProfileSettingsForm } from '@/features/settings/components/profile-settings-form';
import { AccountSettingsForm } from '@/features/settings/components/account-settings-form';
import { CompanySettingsForm } from '@/features/settings/components/company-settings-form';
import { NotificationSettingsForm } from '@/features/settings/components/notification-settings-form';
import { EmailSettingsCard } from '@/features/settings/components/email-settings-card';
import { CalendarSettingsForm } from '@/features/settings/components/calendar-settings-form';
import { SecuritySettingsCard } from '@/features/settings/components/security-settings-card';
import { CRMPreferencesForm } from '@/features/settings/components/crm-preferences-form';
import { SettingsTab } from '@/features/settings/types/settings-types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function SettingsHubPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const isOwnerOrAdmin = user?.role === 'COMPANY_OWNER' || user?.role === 'ADMIN';

  const tabParam = (searchParams.get('tab') as SettingsTab) || 'profile';
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(tabParam);

  React.useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const tabTitles: Record<SettingsTab, { title: string; desc: string }> = {
    profile: {
      title: 'Profile Settings',
      desc: 'View and update your personal details, job title, and contact methods.',
    },
    account: {
      title: 'Account & Regional Settings',
      desc: 'Customize language, timezone, calendar formats, and default currencies.',
    },
    company: {
      title: 'Company & Organization',
      desc: 'Manage business entity details, legal registration, branding, and tax information.',
    },
    users: {
      title: 'Users & Permissions Hub',
      desc: 'Manage workspace members, assign role permissions, and review security matrices.',
    },
    notifications: {
      title: 'Notification Preferences',
      desc: 'Configure in-app bell alerts and email dispatches across all CRM events.',
    },
    email: {
      title: 'Email Delivery Gateway',
      desc: 'Verified email sender address, transactional provider status, and dispatch tests.',
    },
    calendar: {
      title: 'Calendar & Availability',
      desc: 'Set working hours, meeting duration defaults, reminders, and start-of-week.',
    },
    security: {
      title: 'Account Security',
      desc: 'Manage your password, review active login sessions, and secure your account.',
    },
    crm: {
      title: 'CRM Module Preferences',
      desc: 'Configure default customer views, lead kanban layouts, and financial formatting.',
    },
  };

  return (
    <ContentContainer>
      <PageHeader
        title={tabTitles[activeTab]?.title || 'Settings'}
        description={tabTitles[activeTab]?.desc || 'Configure your workspace and system settings.'}
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: tabTitles[activeTab]?.title.split(' ')[0] || 'Hub' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Navigation Menu */}
        <div className="lg:col-span-1">
          <Card className="p-2 sticky top-20">
            <SettingsNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              canManageCompany={isOwnerOrAdmin}
            />
          </Card>
        </div>

        {/* Main Settings Content Form Panel */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileSettingsForm />}
          {activeTab === 'account' && <AccountSettingsForm />}
          {activeTab === 'company' && <CompanySettingsForm />}

          {/* Users & Roles Section with Quick Jump Cards */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base font-semibold">User & Role Management</CardTitle>
                      <CardDescription className="text-xs">
                        Access detailed team member directories, assign security roles, and review permission matrix.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/20 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-sm text-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Workspace Users</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Invite new employees or clients, generate credentials, and toggle account activation status.
                      </p>
                    </div>
                    <Link href="/settings/users">
                      <Button size="sm" variant="default" className="w-full">
                        <span>Open User Management</span>
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-muted/20 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-sm text-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Roles & Permissions Matrix</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Review deterministic role capabilities for Company Owner, Admin, Employee, and Client accounts.
                      </p>
                    </div>
                    <Link href="/settings/roles">
                      <Button size="sm" variant="outline" className="w-full">
                        <span>View Permissions Matrix</span>
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && <NotificationSettingsForm />}
          {activeTab === 'email' && <EmailSettingsCard />}
          {activeTab === 'calendar' && <CalendarSettingsForm />}
          {activeTab === 'security' && <SecuritySettingsCard />}
          {activeTab === 'crm' && <CRMPreferencesForm />}
        </div>
      </div>
    </ContentContainer>
  );
}
