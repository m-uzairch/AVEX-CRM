'use client';

import * as React from 'react';
import { CalendarEvent } from '../types/calendar-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  MapPin,
  Video,
  User,
  FolderKanban,
  Building2,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventDetailDialogProps {
  isOpen: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => Promise<void>;
}

export function EventDetailDialog({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (!isOpen || !event) return null;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(event.id);
      onClose();
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const getEventBadgeStyles = (eventType: string) => {
    switch (eventType) {
      case 'CLIENT_MEETING':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'MEETING':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'PROJECT_DEADLINE':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'MILESTONE':
        return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
      case 'TASK':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'FOLLOW_UP':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      default:
        return 'bg-primary/15 text-primary border-primary/30';
    }
  };

  const formattedDateRange = () => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    const dateStr = start.toLocaleDateString('default', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (event.allDay) {
      return `${dateStr} (All Day)`;
    }

    const startT = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endT = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} • ${startT} - ${endT}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={cn('text-[10px] uppercase font-mono px-1.5 py-0', getEventBadgeStyles(event.eventType))}
              >
                {event.eventType.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                {event.status}
              </Badge>
              {event.isClientVisible && (
                <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  Client Visible
                </Badge>
              )}
            </div>
            <h3 className="text-base font-bold text-foreground mt-1">{event.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Timing */}
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-foreground">{formattedDateRange()}</span>
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Location & Virtual Meeting Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {event.location && (
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center space-x-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span className="font-semibold">Location</span>
                </div>
                <p className="text-foreground">{event.location}</p>
              </div>
            )}

            {event.meetingLink && (
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center space-x-1.5 text-muted-foreground">
                  <Video className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold">Virtual Meeting</span>
                </div>
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-primary hover:underline font-mono"
                >
                  <span className="truncate max-w-[180px]">{event.meetingLink}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Meeting Join Button */}
          {event.meetingLink && (
            <div className="pt-1">
              <a
                href={event.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Video className="h-4 w-4" />
                <span>Join {event.linkPlatform || 'Online Video Meeting'}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-75" />
              </a>
            </div>
          )}

          {/* Associated Entities */}
          <div className="space-y-2 pt-2 border-t border-border">
            {event.project && (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="flex items-center space-x-1.5 text-muted-foreground">
                  <FolderKanban className="h-3.5 w-3.5 text-purple-500" />
                  <span>Related Project:</span>
                </span>
                <span className="font-semibold text-foreground">{event.project.name}</span>
              </div>
            )}

            {event.customer && (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="flex items-center space-x-1.5 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Client Account:</span>
                </span>
                <span className="font-semibold text-foreground">
                  {event.customer.companyName || event.customer.name}
                </span>
              </div>
            )}

            {event.organizer && (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="flex items-center space-x-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Organized By:</span>
                </span>
                <span className="font-semibold text-foreground">{event.organizer.fullName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Edit & Delete */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <Button
            type="button"
            variant={confirmDelete ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            )}
            {confirmDelete ? 'Confirm Delete?' : 'Delete Event'}
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              className="text-xs"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Edit Event</span>
            </Button>
            <Button type="button" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
