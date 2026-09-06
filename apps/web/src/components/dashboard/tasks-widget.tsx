import * as React from 'react';
import { WidgetCard } from './widget-card';
import { Badge } from '@/components/ui/badge';
import { MOCK_TASKS, TaskItemData } from '@/features/dashboard/mock-data';
import { CheckSquare, Calendar } from 'lucide-react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyWidgetState } from './empty-widget-state';
import { Plus } from 'lucide-react';

const priorityVariantMap: Record<TaskItemData['priority'], 'destructive' | 'warning' | 'secondary'> = {
  HIGH: 'destructive',
  MEDIUM: 'warning',
  LOW: 'secondary',
};

export function TasksWidget() {
  return (
    <WidgetCard
      title="Upcoming Tasks"
      description="Pending action items requiring review."
      icon={<CheckSquare className="h-4 w-4" />}
      action={
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="text-xs h-8">
            <Plus className="h-3.5 w-3.5 mr-1" /> New Task
          </Button>
        </Link>
      }
    >
      {MOCK_TASKS.length === 0 ? (
        <EmptyWidgetState
          icon={<CheckSquare className="h-5 w-5" />}
          title="No pending tasks"
          description="You're all caught up! Create new action items and assign them to team members."
        />
      ) : (
        <div className="space-y-3 pt-2">
          {MOCK_TASKS.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-md border border-border bg-card/60 hover:bg-accent/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold text-foreground">{task.title}</div>
                <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {task.dueDate}
                  </span>
                  <span>•</span>
                  <span>{task.project}</span>
                </div>
              </div>
              <Badge variant={priorityVariantMap[task.priority]} className="text-[10px]">
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
