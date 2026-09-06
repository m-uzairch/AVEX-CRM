import * as React from 'react';
import { WidgetCard } from './widget-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_ACTIVITIES, ActivityItemData } from '@/features/dashboard/mock-data';
import { Activity, ArrowRight, UserPlus, FileText, UserCheck, FolderKanban } from 'lucide-react';

const typeIconMap: Record<ActivityItemData['type'], React.ReactNode> = {
  customer: <UserPlus className="h-3.5 w-3.5 text-primary" />,
  invoice: <FileText className="h-3.5 w-3.5 text-success" />,
  attendance: <UserCheck className="h-3.5 w-3.5 text-warning" />,
  project: <FolderKanban className="h-3.5 w-3.5 text-accent-foreground" />,
};

import Link from 'next/link';
import { EmptyWidgetState } from './empty-widget-state';

export function ActivityWidget() {
  return (
    <WidgetCard
      title="Recent Activity"
      description="Latest company transactions and logs."
      icon={<Activity className="h-4 w-4" />}
      action={
        <Link href="/crm">
          <Button variant="ghost" size="sm" className="text-xs h-8">
            View CRM <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      }
    >
      {MOCK_ACTIVITIES.length === 0 ? (
        <EmptyWidgetState
          icon={<Activity className="h-5 w-5" />}
          title="No activity recorded yet"
          description="Customer interactions, pipeline updates, and invoice events will appear in your timeline."
        />
      ) : (
        <div className="space-y-4 pt-2">
          {MOCK_ACTIVITIES.map((act) => (
            <div key={act.id} className="flex items-start space-x-3 text-xs">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                {typeIconMap[act.type]}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="font-semibold text-foreground">{act.title}</div>
                <div className="text-muted-foreground">{act.subtitle}</div>
              </div>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                {act.time}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
