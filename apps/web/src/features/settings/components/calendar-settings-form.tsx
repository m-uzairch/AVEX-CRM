'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsService } from '../services/settings-service';
import { Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export function CalendarSettingsForm() {
  const { success, error: toastError } = useToast();

  const [defaultView, setDefaultView] = React.useState<'MONTH' | 'WEEK' | 'DAY' | 'AGENDA'>('WEEK');
  const [weekStartDay, setWeekStartDay] = React.useState<'SUNDAY' | 'MONDAY'>('MONDAY');
  const [timezone, setTimezone] = React.useState('UTC');
  const [workingHoursStart, setWorkingHoursStart] = React.useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = React.useState('18:00');
  const [defaultEventDuration, setDefaultEventDuration] = React.useState(30);
  const [meetingReminders, setMeetingReminders] = React.useState(15);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await SettingsService.getCalendarSettings();
        setDefaultView(data.defaultView);
        setWeekStartDay(data.weekStartDay);
        setTimezone(data.timezone);
        setWorkingHoursStart(data.workingHoursStart);
        setWorkingHoursEnd(data.workingHoursEnd);
        setDefaultEventDuration(data.defaultEventDuration);
        setMeetingReminders(data.meetingReminders);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load calendar settings');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      await SettingsService.updateCalendarSettings({
        defaultView,
        weekStartDay,
        timezone,
        workingHoursStart,
        workingHoursEnd,
        defaultEventDuration: Number(defaultEventDuration),
        meetingReminders: Number(meetingReminders),
      });
      success('Calendar preferences saved', 'Your working hours and calendar defaults have been updated.');
      setStatusMsg('Calendar settings saved successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to save calendar settings.';
      setErrorMsg(msg);
      toastError('Save failed', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold">Calendar Preferences</CardTitle>
            <CardDescription className="text-xs">
              Configure working availability, week start preferences, meeting defaults, and reminders.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          {statusMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-destructive/15 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Calendar View</label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="MONTH">Month View</option>
                <option value="WEEK">Week View</option>
                <option value="DAY">Day View</option>
                <option value="AGENDA">Agenda / List View</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Week Starts On</label>
              <select
                value={weekStartDay}
                onChange={(e) => setWeekStartDay(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="MONDAY">Monday (Standard)</option>
                <option value="SUNDAY">Sunday (US / Middle East)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Working Hours Start</label>
              <Input
                type="time"
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Working Hours End</label>
              <Input
                type="time"
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Event Duration</label>
              <select
                value={defaultEventDuration}
                onChange={(e) => setDefaultEventDuration(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes (1 Hour)</option>
                <option value="90">90 Minutes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Meeting Reminder Alerts</label>
              <select
                value={meetingReminders}
                onChange={(e) => setMeetingReminders(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-border pt-4">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Save Calendar Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
