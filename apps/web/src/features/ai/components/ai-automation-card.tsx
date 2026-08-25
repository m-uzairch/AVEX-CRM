'use client';

import * as React from 'react';
import { AIAutomationItem } from '../schemas/ai-automation-schemas';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Mail,
  Calendar,
  Bell,
  X,
} from 'lucide-react';

interface AIAutomationCardProps {
  item: AIAutomationItem;
  onReview: (item: AIAutomationItem) => void;
  onDismiss: (id: string) => void;
}

export function AIAutomationCard({ item, onReview, onDismiss }: AIAutomationCardProps) {
  const getActionIcon = (actionType: AIAutomationItem['actionType']) => {
    switch (actionType) {
      case 'SEND_EMAIL_REMINDER':
        return <Mail className="h-4 w-4 text-emerald-500" />;
      case 'CREATE_CALENDAR_TASK':
      case 'SCHEDULE_FOLLOW_UP':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'DISPATCH_NOTIFICATION':
      default:
        return <Bell className="h-4 w-4 text-amber-500" />;
    }
  };

  const getUrgencyBadge = (urgency: AIAutomationItem['urgency']) => {
    switch (urgency) {
      case 'CRITICAL':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold">
            Critical Urgency
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
            High Priority
          </Badge>
        );
      case 'MEDIUM':
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground font-semibold">
            Standard
          </Badge>
        );
    }
  };

  const isPending = item.status === 'PENDING_APPROVAL';

  return (
    <Card
      className={cn(
        'border transition-all duration-200 hover:shadow-xs overflow-hidden bg-card/80 backdrop-blur-xs',
        item.status === 'EXECUTED'
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : item.status === 'DISMISSED'
          ? 'opacity-60 border-border'
          : item.urgency === 'CRITICAL'
          ? 'border-rose-500/30 bg-rose-500/5'
          : 'border-border'
      )}
    >
      <CardContent className="p-5 space-y-3.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-background border border-border shadow-2xs">
              {getActionIcon(item.actionType)}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                {item.triggerType.replace(/_/g, ' ')}
              </Badge>
              {getUrgencyBadge(item.urgency)}
            </div>
          </div>

          {isPending ? (
            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              title="Dismiss Proposal"
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Badge
              variant={item.status === 'EXECUTED' ? 'default' : 'secondary'}
              className="text-[10px] capitalize"
            >
              {item.status === 'EXECUTED' ? 'Executed' : 'Dismissed'}
            </Badge>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-foreground leading-snug">{item.title}</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
        </div>

        {/* Prepared Payload Preview */}
        {item.preparedPayload.subject && (
          <div className="p-2.5 rounded-lg bg-background/90 border border-border text-[11px] space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
              Prepared Subject:
            </span>
            <p className="font-medium text-foreground truncate">{item.preparedPayload.subject}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {item.status === 'EXECUTED'
              ? `Completed ${new Date(item.executedAt || item.createdAt).toLocaleDateString()}`
              : `Prepared by AI engine`}
          </span>

          {isPending && (
            <Button
              size="sm"
              onClick={() => onReview(item)}
              className="h-7 text-xs font-semibold px-3"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              <span>Review & Execute</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
