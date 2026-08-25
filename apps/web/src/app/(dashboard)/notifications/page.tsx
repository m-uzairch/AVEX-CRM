'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationFilterTabs } from '@/features/notifications/components/notification-filter-tabs';
import { NotificationListItem } from '@/features/notifications/components/notification-list-item';
import { NotificationService } from '@/features/notifications/services/notification-service';
import {
  CRMNotification,
  NotificationCategory,
  NotificationKPIs,
} from '@/features/notifications/types/notification-types';
import { useToast } from '@/providers/toast-provider';
import {
  Bell,
  Search,
  CheckCheck,
  Settings,
  Loader2,
  Inbox,
  DollarSign,
  UserCheck,
  FolderKanban,
} from 'lucide-react';

export default function NotificationCenterPage() {
  const { success, error: toastError } = useToast();

  const [notifications, setNotifications] = React.useState<CRMNotification[]>([]);
  const [kpis, setKpis] = React.useState<NotificationKPIs>({
    totalCount: 0,
    unreadCount: 0,
    financeCount: 0,
    crmCount: 0,
    projectsCount: 0,
    meetingsCount: 0,
  });

  const [selectedCategory, setSelectedCategory] = React.useState<'ALL' | NotificationCategory>('ALL');
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await NotificationService.getNotifications({
        search: searchQuery,
        category: selectedCategory,
        unreadOnly,
      });
      setNotifications(data.notifications);
      setKpis(data.kpis);
    } catch (err: any) {
      toastError('Failed to load notifications', err.message || 'Error fetching notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, unreadOnly, toastError]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleToggleRead = async (id: string, currentReadState: boolean) => {
    try {
      const updated = await NotificationService.toggleRead(id, !currentReadState);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setKpis((prev) => ({
        ...prev,
        unreadCount: currentReadState ? prev.unreadCount + 1 : Math.max(0, prev.unreadCount - 1),
      }));
    } catch (err: any) {
      toastError('Update failed', err.message || 'Could not update notification.');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await NotificationService.dismiss(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      success('Notification dismissed', 'The notification has been removed.');
      loadNotifications();
    } catch (err: any) {
      toastError('Dismiss failed', err.message || 'Could not dismiss notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await NotificationService.markAllAsRead();
      success('All marked as read', `Marked ${res.count} notifications as read.`);
      loadNotifications();
    } catch (err: any) {
      toastError('Action failed', err.message || 'Could not mark all as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Notification Center"
        description="Real-time alerts, client portal communications, financial transactions, and task assignments across your CRM workspace."
        breadcrumbs={[{ label: 'Notifications' }]}
      />

      {/* KPI Metrics Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Unread Alerts</p>
              <p className="text-lg font-bold text-foreground">{kpis.unreadCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Finance & Payments</p>
              <p className="text-lg font-bold text-foreground">{kpis.financeCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">CRM & Leads</p>
              <p className="text-lg font-bold text-foreground">{kpis.crmCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Projects & Tasks</p>
              <p className="text-lg font-bold text-foreground">{kpis.projectsCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Notification Card Container */}
      <div className="space-y-4">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs w-full"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll || kpis.unreadCount === 0}
              className="h-8 text-xs font-semibold"
            >
              {isMarkingAll ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
              )}
              <span>Mark All Read</span>
            </Button>

            <Link href="/settings?tab=notifications">
              <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                <span>Preferences</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <NotificationFilterTabs
          selectedCategory={selectedCategory}
          unreadOnly={unreadOnly}
          onSelectCategory={setSelectedCategory}
          onToggleUnreadOnly={setUnreadOnly}
          counts={{
            all: kpis.totalCount,
            unread: kpis.unreadCount,
            finance: kpis.financeCount,
            crm: kpis.crmCount,
            projects: kpis.projectsCount,
            meetings: kpis.meetingsCount,
            portal: notifications.filter((n) => n.category === 'PORTAL').length,
          }}
        />

        {/* Notifications Feed */}
        {isLoading ? (
          <Card className="p-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <Inbox className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <h3 className="font-semibold text-sm text-foreground">No notifications to display</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {unreadOnly
                ? 'You are all caught up! No unread notifications found.'
                : 'No alerts match your current search and filter settings.'}
            </p>
            {unreadOnly && (
              <Button size="sm" variant="outline" onClick={() => setUnreadOnly(false)} className="mt-4 text-xs">
                View All Activity
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <NotificationListItem
                key={n.id}
                notification={n}
                onToggleRead={handleToggleRead}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </div>
    </ContentContainer>
  );
}
