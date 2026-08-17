'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { meetingFormSchema, MeetingFormValues } from '../schemas/communication-schemas';
import { Meeting } from '../types/communication-types';
import { Loader2, Calendar, Link as LinkIcon } from 'lucide-react';

interface MeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  meeting?: Meeting | null;
  onSave: (values: MeetingFormValues) => Promise<void>;
}

const LINK_PLATFORMS = [
  { value: 'google_meet', label: '🎯 Google Meet' },
  { value: 'zoom', label: '🔵 Zoom' },
  { value: 'teams', label: '🟣 Microsoft Teams' },
  { value: 'custom', label: '🔗 Custom Link' },
];

export function MeetingDialog({ open, onOpenChange, projectId, meeting, onSave }: MeetingDialogProps) {
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: projectId || '',
      startTime: '',
      endTime: '',
      timezone: 'UTC',
      meetingType: 'ONLINE',
      meetingLink: '',
      linkPlatform: 'google_meet',
      isClientVisible: false,
    },
  });

  const meetingType = watch('meetingType');

  React.useEffect(() => {
    if (open) {
      reset({
        title: meeting?.title || '',
        description: meeting?.description || '',
        projectId: meeting?.projectId || projectId || '',
        startTime: meeting?.startTime ? meeting.startTime.substring(0, 16) : '',
        endTime: meeting?.endTime ? meeting.endTime.substring(0, 16) : '',
        timezone: meeting?.timezone || 'UTC',
        meetingType: meeting?.meetingType || 'ONLINE',
        meetingLink: meeting?.meetingLink || '',
        linkPlatform: (meeting?.linkPlatform as MeetingFormValues['linkPlatform']) || 'google_meet',
        isClientVisible: meeting?.isClientVisible || false,
      });
    }
  }, [open, meeting, projectId, reset]);

  const onSubmit = async (values: MeetingFormValues) => {
    try {
      setSaving(true);
      await onSave(values);
      onOpenChange(false);
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={meeting ? 'Edit Meeting' : 'Schedule New Meeting'}
      description="Schedule a team or client meeting with participants and calendar details."
      className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs py-2">
        {/* Title */}
        <div className="space-y-1">
          <label className="font-semibold text-foreground">
            Meeting Title <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Design Kickoff Review Session"
            {...register('title')}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-[11px] text-destructive">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="font-semibold text-foreground">Agenda / Description</label>
          <Textarea placeholder="Describe the meeting agenda..." rows={3} {...register('description')} />
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Start Time <span className="text-destructive">*</span></label>
            <Input type="datetime-local" {...register('startTime')} className={errors.startTime ? 'border-destructive' : ''} />
            {errors.startTime && <p className="text-[11px] text-destructive">{errors.startTime.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground">End Time <span className="text-destructive">*</span></label>
            <Input type="datetime-local" {...register('endTime')} className={errors.endTime ? 'border-destructive' : ''} />
            {errors.endTime && <p className="text-[11px] text-destructive">{errors.endTime.message}</p>}
          </div>
        </div>

        {/* Meeting Type & Timezone */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Meeting Type</label>
            <select {...register('meetingType')} className="w-full text-xs rounded-md border border-input bg-background p-2.5">
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In Person</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Timezone</label>
            <select {...register('timezone')} className="w-full text-xs rounded-md border border-input bg-background p-2.5">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="Asia/Karachi">Karachi (PKT)</option>
            </select>
          </div>
        </div>

        {/* Link Platform (Online only) */}
        {meetingType === 'ONLINE' && (
          <div className="space-y-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-primary" /> Meeting Platform
              </label>
              <select {...register('linkPlatform')} className="w-full text-xs rounded-md border border-input bg-background p-2.5">
                {LINK_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Meeting Link</label>
              <Input placeholder="https://meet.google.com/abc-xyz-123" {...register('meetingLink')} />
            </div>
          </div>
        )}

        {/* Google Calendar Hook Info */}
        <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[11px] text-amber-600 dark:text-amber-400">
          <span className="font-bold flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Google Calendar Sync
          </span>
          <p className="mt-0.5 text-muted-foreground">Calendar event will be created automatically via Google Calendar API when OAuth is configured in Settings.</p>
        </div>

        {/* Client Visibility */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" {...register('isClientVisible')} className="h-4 w-4 rounded border-input text-primary" />
          <div>
            <span className="font-semibold text-foreground block">Invite Client to this Meeting</span>
            <span className="text-[10px] text-muted-foreground">Meeting will appear in Client Portal under scheduled meetings.</span>
          </div>
        </label>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-2 font-bold">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {meeting ? 'Update Meeting' : 'Schedule Meeting'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
