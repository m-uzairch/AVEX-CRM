'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsService } from '../services/settings-service';
import { NotificationPreferences } from '../types/settings-types';
import { Bell, CheckCircle2, AlertCircle, Loader2, Mail, Smartphone } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface EventConfig {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}

const CRM_NOTIFICATION_EVENTS: EventConfig[] = [
  { key: 'newLead', title: 'New Leads Captured', description: 'When a new lead is submitted from forms or API integrations.' },
  { key: 'leadAssignment', title: 'Lead Assignment', description: 'When a sales lead is assigned or reassigned to you.' },
  { key: 'customerUpdates', title: 'Customer Account Changes', description: 'When customer profile, company name, or status is modified.' },
  { key: 'taskAssignment', title: 'Task & Subtask Assignment', description: 'When you are assigned as owner or contributor on a task.' },
  { key: 'projectUpdates', title: 'Project Status & Milestones', description: 'When a project milestone is completed or stage changes.' },
  { key: 'invoiceEvents', title: 'Invoice Issued & Viewed', description: 'When an invoice is issued, viewed by client, or overdue.' },
  { key: 'paymentEvents', title: 'Payments Received & Receipts', description: 'When a client payment is confirmed and receipt logged.' },
  { key: 'clientRequests', title: 'Client Scope & Change Requests', description: 'When a customer files a new change request in the client portal.' },
  { key: 'clientMessages', title: 'Client Direct Messages & Replies', description: 'When a new message or file attachment arrives in client chat.' },
  { key: 'meetings', title: 'Meeting Invitations & Reminders', description: 'When a calendar meeting or client review call is scheduled.' },
  { key: 'attendanceEvents', title: 'Attendance & Shift Reminders', description: 'Daily clock-in/clock-out check-in notifications.' },
];

export function NotificationSettingsForm() {
  const { success, error: toastError } = useToast();
  const [preferences, setPreferences] = React.useState<NotificationPreferences | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await SettingsService.getNotificationPreferences();
        setPreferences(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleToggle = (eventKey: keyof NotificationPreferences, channel: 'inApp' | 'email') => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [eventKey]: {
        ...preferences[eventKey],
        [channel]: !preferences[eventKey][channel],
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    setIsSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const updated = await SettingsService.updateNotificationPreferences(preferences);
      setPreferences(updated);
      success('Preferences saved', 'Your notification delivery settings have been updated.');
      setStatusMsg('Notification preferences saved successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to save notification preferences.';
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
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
            <CardDescription className="text-xs">
              Choose which events send in-app bell alerts and email dispatches.
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

          {/* Table Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-semibold text-muted-foreground px-2">
            <span>Event Category</span>
            <div className="flex items-center space-x-8">
              <span className="flex items-center space-x-1">
                <Smartphone className="h-3.5 w-3.5" />
                <span>In-App</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="h-3.5 w-3.5" />
                <span>Email</span>
              </span>
            </div>
          </div>

          <div className="divide-y divide-border">
            {CRM_NOTIFICATION_EVENTS.map((item) => {
              const currentPref = preferences ? preferences[item.key] : { inApp: true, email: true };

              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors"
                >
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex items-center space-x-8 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPref?.inApp ?? true}
                        onChange={() => handleToggle(item.key, 'inApp')}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                    </label>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPref?.email ?? false}
                        onChange={() => handleToggle(item.key, 'email')}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-border pt-4">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Save Notification Preferences
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
