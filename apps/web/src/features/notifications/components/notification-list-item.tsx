'use client';

import * as React from 'react';
import Link from 'next/link';
import { CRMNotification } from '../types/notification-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  UserCheck,
  FolderKanban,
  Video,
  Globe,
  Bell,
  Clock,
  ExternalLink,
  CheckCircle,
  Circle,
  Trash2,
} from 'lucide-react';

interface NotificationListItemProps {
  notification: CRMNotification;
  onToggleRead: (id: string, currentReadState: boolean) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
}

export function NotificationListItem({
  notification,
  onToggleRead,
  onDismiss,
}: NotificationListItemProps) {
  const isUnread = !notification.readAt;

  const formatRelativeTime = (isoString: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FINANCE':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'CRM':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'PROJECTS':
        return <FolderKanban className="h-4 w-4 text-purple-500" />;
      case 'COMMUNICATION':
        return <Video className="h-4 w-4 text-rose-500" />;
      case 'PORTAL':
        return <Globe className="h-4 w-4 text-cyan-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'URGENT') {
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 uppercase tracking-wider">
          Urgent
        </Badge>
      );
    }
    if (priority === 'HIGH') {
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          High
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        'transition-all border',
        isUnread
          ? 'bg-primary/5 border-primary/25 shadow-xs'
          : 'bg-card border-border hover:bg-muted/20'
      )}
    >
      <CardContent className="p-4 flex flex-col sm:flex-row items-start justify-between gap-3">
        {/* Left Side: Icon & Details */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          {/* Category Icon Container */}
          <div className="p-2.5 rounded-xl bg-muted/60 shrink-0 mt-0.5 border border-border/50">
            {getCategoryIcon(notification.category)}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            {/* Header: Unread indicator, Title, Priority */}
            <div className="flex items-center space-x-2 flex-wrap">
              {isUnread && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" title="Unread" />
              )}
              <h4 className={cn('text-sm font-semibold text-foreground truncate', isUnread && 'font-bold')}>
                {notification.title}
              </h4>
              {getPriorityBadge(notification.priority)}
            </div>

            {/* Message Body */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {notification.message}
            </p>

            {/* Meta Row: Timestamp, Category, Entity Link */}
            <div className="flex items-center space-x-3 text-[11px] text-muted-foreground pt-1.5 flex-wrap gap-y-1">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(notification.createdAt)}</span>
              </span>

              <span>•</span>

              <span className="font-medium text-foreground/80 uppercase tracking-wider text-[10px]">
                {notification.category}
              </span>

              {notification.link && (
                <>
                  <span>•</span>
                  <Link
                    href={notification.link}
                    className="inline-flex items-center space-x-1 text-primary font-semibold hover:underline"
                  >
                    <span>View Record</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggleRead(notification.id, !isUnread)}
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
          >
            {isUnread ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 mr-1 text-primary" />
                <span>Mark Read</span>
              </>
            ) : (
              <>
                <Circle className="h-3.5 w-3.5 mr-1" />
                <span>Mark Unread</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            title="Dismiss notification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
