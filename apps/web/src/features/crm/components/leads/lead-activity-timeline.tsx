'use client';

import * as React from 'react';
import { ActivityService } from '../../services/activity-service';
import { CRMActivityLog } from '../../types/activity-note-types';
import { ActivityTimelineView } from '../activities/activity-timeline-view';
import { Activity } from 'lucide-react';

interface LeadActivityTimelineProps {
  leadId?: string;
  logs?: unknown[];
}

export function LeadActivityTimeline({ leadId }: LeadActivityTimelineProps) {
  const [activities, setActivities] = React.useState<CRMActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadActivities = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (leadId) {
        const res = await ActivityService.fetchTimeline({
          entityType: 'LEAD',
          entityId: leadId,
          pageSize: 50,
        });
        setActivities(res.activities);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center space-x-2">
        <Activity className="h-4 w-4 text-primary" />
        <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
          Lead Activity & Audit Timeline ({activities.length})
        </h4>
      </div>

      <ActivityTimelineView activities={activities} isLoading={isLoading} />
    </div>
  );
}
