'use client';

import * as React from 'react';
import { CalendarEvent } from '../types/calendar-types';
import { CalendarEventFormValues } from '../schemas/calendar-event-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Calendar as CalendarIcon, X } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface EventDialogProps {
  isOpen: boolean;
  eventToEdit?: CalendarEvent | null;
  initialDate?: Date;
  initialHour?: number;
  onClose: () => void;
  onSubmit: (values: CalendarEventFormValues) => Promise<void>;
}

export function EventDialog({
  isOpen,
  eventToEdit,
  initialDate,
  initialHour,
  onClose,
  onSubmit,
}: EventDialogProps) {
  const { error: toastError } = useToast();

  const formatDateYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const defaultStartDate = initialDate ? formatDateYMD(initialDate) : formatDateYMD(new Date());
  const defaultStartTime = initialHour !== undefined ? `${initialHour.toString().padStart(2, '0')}:00` : '10:00';
  const defaultEndTime = initialHour !== undefined ? `${(initialHour + 1).toString().padStart(2, '0')}:00` : '11:00';

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [eventType, setEventType] = React.useState<CalendarEventFormValues['eventType']>('MEETING');
  const [status, setStatus] = React.useState<CalendarEventFormValues['status']>('SCHEDULED');
  const [startDate, setStartDate] = React.useState(defaultStartDate);
  const [startTime, setStartTime] = React.useState(defaultStartTime);
  const [endDate, setEndDate] = React.useState(defaultStartDate);
  const [endTime, setEndTime] = React.useState(defaultEndTime);
  const [allDay, setAllDay] = React.useState(false);
  const [location, setLocation] = React.useState('');
  const [meetingLink, setMeetingLink] = React.useState('');
  const [linkPlatform, setLinkPlatform] = React.useState('Google Meet');
  const [isClientVisible, setIsClientVisible] = React.useState(false);
  const [reminderMinutes, setReminderMinutes] = React.useState(15);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setEventType(eventToEdit.eventType);
      setStatus(eventToEdit.status);

      const start = new Date(eventToEdit.startTime);
      const end = new Date(eventToEdit.endTime);

      setStartDate(formatDateYMD(start));
      setStartTime(start.toTimeString().substring(0, 5));
      setEndDate(formatDateYMD(end));
      setEndTime(end.toTimeString().substring(0, 5));
      setAllDay(eventToEdit.allDay);
      setLocation(eventToEdit.location || '');
      setMeetingLink(eventToEdit.meetingLink || '');
      setLinkPlatform(eventToEdit.linkPlatform || 'Google Meet');
      setIsClientVisible(eventToEdit.isClientVisible);
      setReminderMinutes(eventToEdit.reminderMinutes || 15);
    } else {
      setTitle('');
      setDescription('');
      setEventType('MEETING');
      setStatus('SCHEDULED');
      setStartDate(defaultStartDate);
      setStartTime(defaultStartTime);
      setEndDate(defaultStartDate);
      setEndTime(defaultEndTime);
      setAllDay(false);
      setLocation('');
      setMeetingLink('');
      setLinkPlatform('Google Meet');
      setIsClientVisible(false);
      setReminderMinutes(15);
    }
    setErrorMsg(null);
  }, [eventToEdit, isOpen, defaultStartDate, defaultStartTime, defaultEndTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit({
        title,
        description,
        eventType,
        status,
        startDate,
        startTime,
        endDate,
        endTime,
        allDay,
        location,
        meetingLink: meetingLink || undefined,
        linkPlatform,
        isClientVisible,
        reminderMinutes: Number(reminderMinutes),
      });
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to save event.';
      setErrorMsg(msg);
      toastError('Save failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {eventToEdit ? 'Edit Calendar Event' : 'Schedule New Event'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/15 text-destructive text-xs">
                {errorMsg}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Event Title *</label>
              <Input
                placeholder="e.g. Q3 Roadmap Review or Client Kickoff"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
                >
                  <option value="MEETING">Internal Team Meeting</option>
                  <option value="CLIENT_MEETING">Client Portal Meeting</option>
                  <option value="PROJECT_DEADLINE">Project Deadline</option>
                  <option value="MILESTONE">Project Milestone</option>
                  <option value="TASK">Task Deadline</option>
                  <option value="FOLLOW_UP">Customer Follow-up</option>
                  <option value="REMINDER">Reminder</option>
                  <option value="EVENT">General Company Event</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Start Date & Time</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                  <Input
                    type="time"
                    value={startTime}
                    disabled={allDay}
                    onChange={(e) => setStartTime(e.target.value)}
                    required={!allDay}
                    className="h-8 text-xs disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">End Date & Time</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                  <Input
                    type="time"
                    value={endTime}
                    disabled={allDay}
                    onChange={(e) => setEndTime(e.target.value)}
                    required={!allDay}
                    className="h-8 text-xs disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="allDayCheck"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="allDayCheck" className="text-xs font-medium text-foreground cursor-pointer">
                All-Day Event (No specific start/end time)
              </label>
            </div>

            {/* Location & Meeting Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Physical Location</label>
                <Input
                  placeholder="Conference Room B / Office"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Virtual Meeting Link</label>
                <Input
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Client Portal Visibility */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Sync with Client Portal</p>
                <p className="text-[11px] text-muted-foreground">Make this meeting visible to the client in their portal</p>
              </div>
              <input
                type="checkbox"
                checked={isClientVisible}
                onChange={(e) => setIsClientVisible(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description / Agenda</label>
              <textarea
                rows={3}
                placeholder="Meeting agenda, discussion points, notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-border rounded-md p-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-2 px-5 py-3 border-t border-border bg-muted/20">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              {eventToEdit ? 'Save Changes' : 'Schedule Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
