'use client';

import * as React from 'react';
import { ContentContainer } from '@/components/layout/content-container';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickActionsWidget } from '@/components/dashboard/quick-actions-widget';
import { ActivityWidget } from '@/components/dashboard/activity-widget';
import { TasksWidget } from '@/components/dashboard/tasks-widget';
import { CalendarWidget } from '@/components/dashboard/calendar-widget';
import { NotificationsWidget } from '@/components/dashboard/notifications-widget';
import { MOCK_DASHBOARD_STATS } from '@/features/dashboard/mock-data';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const company = useAuthStore((state) => state.company);

  const [greeting, setGreeting] = React.useState('Welcome back');
  const [currentDateFormatted, setCurrentDateFormatted] = React.useState('');
  const [stats, setStats] = React.useState(MOCK_DASHBOARD_STATS);
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);

  React.useEffect(() => {
    // Dynamic Time of Day Greeting calculated on client mount to eliminate SSR timezone mismatch
    const currentHour = new Date().getHours();
    const g =
      currentHour < 12
        ? 'Good Morning'
        : currentHour < 18
        ? 'Good Afternoon'
        : 'Good Evening';
    setGreeting(g);

    // Formatted Current Date formatted in client user locale on mount
    const formatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
    setCurrentDateFormatted(formatted);

    // Fetch live synchronized dashboard statistics
    async function loadStats() {
      try {
        setIsLoadingStats(true);
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.stats && Array.isArray(data.stats)) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.warn('Could not load live dashboard stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }

    loadStats();
  }, []);

  const userName = user?.fullName ? user.fullName.split(' ')[0] : 'Uzair';
  const companyName = company?.name || user?.companyName || 'AVEX CRM Workspace';

  return (
    <ContentContainer>
      {/* Welcome Header */}
      <PageHeader
        title={`${greeting}, ${userName} 👋`}
        description={`Welcome back to ${companyName}.${currentDateFormatted ? ` Today is ${currentDateFormatted}.` : ''}`}
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" />
              Export Report
            </Button>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              New Deal
            </Button>
          </div>
        }
      />

      {/* 4 Statistics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats && stats.length === 0
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-muted/40 h-32 rounded-xl border border-border" />
            ))
          : stats.map((stat) => (
              <StatCard key={stat.id} {...stat} />
            ))}
      </div>

      {/* Quick Actions Shortcuts */}
      <QuickActionsWidget />

      {/* Main Grid: Activity & Tasks (2 Cols) vs Calendar & Notifications (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <ActivityWidget />
          <TasksWidget />
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          <CalendarWidget />
          <NotificationsWidget />
        </div>
      </div>
    </ContentContainer>
  );
}
