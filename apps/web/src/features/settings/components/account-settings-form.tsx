'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsService } from '../services/settings-service';
import { Sliders, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export function AccountSettingsForm() {
  const { success, error: toastError } = useToast();

  const [language, setLanguage] = React.useState('en');
  const [timezone, setTimezone] = React.useState('UTC');
  const [dateFormat, setDateFormat] = React.useState<'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'>('YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = React.useState<'12h' | '24h'>('12h');
  const [defaultCurrency, setDefaultCurrency] = React.useState('USD');

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await SettingsService.getAccountSettings();
        setLanguage(data.language);
        setTimezone(data.timezone);
        setDateFormat(data.dateFormat as any);
        setTimeFormat(data.timeFormat);
        setDefaultCurrency(data.defaultCurrency);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load account settings');
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
      await SettingsService.updateAccountSettings({
        language,
        timezone,
        dateFormat,
        timeFormat,
        defaultCurrency,
      });
      success('Preferences saved', 'Your regional and account preferences have been updated.');
      setStatusMsg('Account preferences saved successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to save account settings.';
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
          <Sliders className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold">Account Preferences</CardTitle>
            <CardDescription className="text-xs">
              Configure your regional, localization, timezone, and currency defaults.
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
              <label className="text-xs font-medium text-foreground">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="en">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT / BST)</option>
                <option value="Europe/Paris">Paris, Berlin, Rome (CET)</option>
                <option value="Asia/Dubai">Dubai, Abu Dhabi (GST)</option>
                <option value="Asia/Karachi">Karachi, Islamabad (PKT)</option>
                <option value="Asia/Singapore">Singapore, Hong Kong (SGT)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-23)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (08/23/2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (23/08/2026)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Time Format</label>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="12h">12-Hour (02:30 PM)</option>
                <option value="24h">24-Hour (14:30)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden font-mono"
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="CAD">CAD ($) — Canadian Dollar</option>
                <option value="AUD">AUD ($) — Australian Dollar</option>
                <option value="AED">AED (د.إ) — UAE Dirham</option>
                <option value="PKR">PKR (₨) — Pakistani Rupee</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="SGD">SGD ($) — Singapore Dollar</option>
              </select>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-border pt-4">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Save Preferences
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
