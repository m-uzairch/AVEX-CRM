'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, User, CheckCircle2, Building, UserPlus } from 'lucide-react';
import { UpcomingFollowupItem } from '../../types/dashboard-types';
import Link from 'next/link';

interface UpcomingFollowupsWidgetProps {
  followups: UpcomingFollowupItem[];
  isLoading?: boolean;
}

export function UpcomingFollowupsWidget({
  followups,
  isLoading = false,
}: UpcomingFollowupsWidgetProps) {
  if (isLoading) {
    return (
      <Card className="shadow-2xs border-border">
        <CardContent className="p-6">
          <div className="animate-pulse bg-muted/40 h-56 rounded-xl border border-border" />
        </CardContent>
      </Card>
    );
  }

  const priorityBadgeVariant: Record<string, string> = {
    URGENT: 'bg-red-500/10 text-red-600 border-red-500/20',
    HIGH: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    MEDIUM: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    LOW: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Card className="shadow-2xs border-border text-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-amber-500" />
            <span>Upcoming & Overdue Follow-up Reminders</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Client touchpoints, demo calls, and renewal reminders requiring action.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {followups.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
            No upcoming follow-up reminders scheduled.
          </div>
        ) : (
          followups.map((fol) => {
            const href =
              fol.entityType === 'CUSTOMER'
                ? `/crm/customers/${fol.entityId}`
                : `/crm/leads/${fol.entityId}`;

            return (
              <div
                key={fol.id}
                className={`p-3.5 rounded-xl border transition-colors space-y-2 relative ${
                  fol.isOverdue
                    ? 'bg-red-500/5 border-red-500/40 hover:border-red-500/60'
                    : 'bg-card border-border/80 hover:border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    {fol.entityType === 'CUSTOMER' ? (
                      <Building className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    )}

                    <Link href={href} className="font-bold text-foreground hover:text-primary underline">
                      {fol.entityName}
                    </Link>

                    <span className="text-muted-foreground text-[11px]">({fol.contactName})</span>

                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 ${
                        priorityBadgeVariant[fol.priority] || priorityBadgeVariant.LOW
                      }`}
                    >
                      {fol.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] font-medium shrink-0">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className={fol.isOverdue ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                      {new Date(fol.dueDate).toLocaleDateString()}
                    </span>
                    {fol.isOverdue && (
                      <Badge className="bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0 gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        <span>OVERDUE</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {fol.notes && <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">{fol.notes}</p>}

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1 text-primary" />
                    Assigned: <strong className="text-foreground ml-1">{fol.assignedEmployeeName}</strong>
                  </span>

                  <Link href={href} className="text-primary hover:underline font-semibold flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> View Record
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
