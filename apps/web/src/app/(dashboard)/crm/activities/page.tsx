'use client';

import * as React from 'react';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { ActivityFilterBar } from '@/features/crm/components/activities/activity-filter-bar';
import { ActivityTimelineView } from '@/features/crm/components/activities/activity-timeline-view';
import { ActivityService } from '@/features/crm/services/activity-service';
import { CRMActivityLog, ActivityFilterState } from '@/features/crm/types/activity-note-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Plus, RefreshCw, Layers, MessageSquare, Users } from 'lucide-react';

const initialFilters: ActivityFilterState = {
  search: '',
  module: 'ALL',
  action: 'ALL',
  userId: 'ALL',
  dateRange: 'ALL',
  page: 1,
  pageSize: 20,
};

export default function ActivitiesPage() {
  const [filters, setFilters] = React.useState<ActivityFilterState>(initialFilters);
  const [activities, setActivities] = React.useState<CRMActivityLog[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadActivities = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ActivityService.fetchTimeline(filters);
      setActivities(res.activities);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleLogQuickActivity = async () => {
    const desc = prompt('Enter activity log description:');
    if (!desc || !desc.trim()) return;

    await ActivityService.logActivity({
      action: 'GENERAL_ACTIVITY',
      module: 'CRM',
      category: 'SYSTEM',
      description: desc.trim(),
    });

    loadActivities();
  };

  return (
    <CRMLayout
      title="Centralized Activity Timeline & Audit Trail"
      description="Track every customer event, lead status change, team note, file attachment, and employee assignment across your organization."
      breadcrumbs={[{ label: 'Activities' }]}
      showToolbar={false}
    >
      <div className="space-y-6 text-xs">
        {/* KPI Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Total Activities</p>
                <h3 className="text-xl font-extrabold text-foreground mt-0.5">{total}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Customer Events</p>
                <h3 className="text-xl font-extrabold text-foreground mt-0.5">
                  {activities.filter((a) => a.module === 'CUSTOMERS').length}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Pipeline Actions</p>
                <h3 className="text-xl font-extrabold text-foreground mt-0.5">
                  {activities.filter((a) => a.module === 'LEADS').length}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Internal Notes Logged</p>
                <h3 className="text-xl font-extrabold text-foreground mt-0.5">
                  {activities.filter((a) => a.action.includes('NOTE')).length}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <MessageSquare className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleLogQuickActivity}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Manual Activity</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={loadActivities}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Timeline</span>
            </Button>
          </div>

          <div className="text-muted-foreground font-medium">
            Showing Page {filters.page} of {totalPages} ({total} entries)
          </div>
        </div>

        {/* Filter Toolbar */}
        <ActivityFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Chronological Activity Feed */}
        <Card className="border-border shadow-2xs">
          <CardContent className="p-6">
            <ActivityTimelineView activities={activities} isLoading={isLoading} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="text-xs"
                >
                  Previous
                </Button>
                <span className="text-muted-foreground font-semibold">
                  Page {filters.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
