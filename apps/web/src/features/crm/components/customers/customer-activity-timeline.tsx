'use client';

import * as React from 'react';
import { ActivityService } from '../../services/activity-service';
import { CRMActivityLog } from '../../types/activity-note-types';
import { ActivityTimelineView } from '../activities/activity-timeline-view';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface CustomerActivityTimelineProps {
  customerId: string;
  searchQuery?: string;
}

export function CustomerActivityTimeline({ customerId, searchQuery = '' }: CustomerActivityTimelineProps) {
  const [activities, setActivities] = React.useState<CRMActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadActivities = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ActivityService.fetchTimeline({
        entityType: 'CUSTOMER',
        entityId: customerId,
        search: searchQuery,
        pageSize: 50,
      });
      setActivities(res.activities);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [customerId, searchQuery]);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return (
    <Card className="shadow-xs border-border text-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Customer Activity & Audit Timeline</h3>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ActivityTimelineView activities={activities} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
