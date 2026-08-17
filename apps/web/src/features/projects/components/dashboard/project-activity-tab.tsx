'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectActivityLog } from '../../types/project-types';
import { Activity, Clock, User } from 'lucide-react';

interface ProjectActivityTabProps {
  activities: ProjectActivityLog[];
}

export function ProjectActivityTab({ activities }: ProjectActivityTabProps) {
  return (
    <Card>
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Project Activity Audit Timeline
        </CardTitle>
        <CardDescription>Complete historical record of all project updates, status transitions, and team modifications.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No activity logs recorded for this project yet.
          </div>
        ) : (
          <div className="relative border-l border-border ml-3 space-y-6 my-2">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-6">
                <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">{act.description}</p>
                  <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(act.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {act.user?.fullName && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <User className="h-3 w-3" /> {act.user.fullName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
