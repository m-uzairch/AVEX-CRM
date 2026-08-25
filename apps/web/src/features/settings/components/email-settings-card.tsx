'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SettingsService } from '../services/settings-service';
import { EmailSettingsConfig } from '../types/settings-types';
import { Mail, CheckCircle2, AlertCircle, Loader2, Send, ShieldCheck, Server } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export function EmailSettingsCard() {
  const { success, error: toastError } = useToast();
  const [config, setConfig] = React.useState<EmailSettingsConfig | null>(null);
  const [testEmail, setTestEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSendingTest, setIsSendingTest] = React.useState(false);
  const [testStatusMsg, setTestStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await SettingsService.getEmailConfig();
        setConfig(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load email configuration');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setIsSendingTest(true);
    setTestStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await SettingsService.sendTestEmail(testEmail);
      success('Email dispatched', res.message);
      setTestStatusMsg(res.message);
      setTestEmail('');
    } catch (err: any) {
      const msg = err.message || 'Failed to send test email.';
      setErrorMsg(msg);
      toastError('Dispatch failed', msg);
    } finally {
      setIsSendingTest(false);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">Transactional Email Gateway</CardTitle>
                <CardDescription className="text-xs">
                  Active delivery provider and verified outbound sender configuration.
                </CardDescription>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">
              {config?.status || 'CONNECTED'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center space-x-2 text-muted-foreground text-xs mb-1">
                <Server className="h-3.5 w-3.5" />
                <span className="font-semibold">Provider</span>
              </div>
              <p className="text-xs font-bold text-foreground">{config?.provider || 'Resend Cloud Gateway'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">High-deliverability SMTP & HTTP API</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center space-x-2 text-muted-foreground text-xs mb-1">
                <Mail className="h-3.5 w-3.5" />
                <span className="font-semibold">Sender Address</span>
              </div>
              <p className="text-xs font-mono font-bold text-foreground truncate">{config?.senderEmail || 'onboarding@resend.dev'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Automated transactional sender</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center space-x-2 text-muted-foreground text-xs mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-semibold">Secret Encryption</span>
              </div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Server-Side Protected</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Secrets never exposed to client</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Dispatcher */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Send Test Email</CardTitle>
          <CardDescription className="text-xs">
            Verify outbound email deliverability by sending a test message to your inbox.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSendTest}>
          <CardContent className="space-y-3">
            {testStatusMsg && (
              <div className="flex items-center space-x-2 rounded-lg bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{testStatusMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center space-x-2 rounded-lg bg-destructive/15 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="you@company.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                required
                className="h-9 text-xs flex-1"
              />
              <Button type="submit" size="sm" disabled={isSendingTest}>
                {isSendingTest ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1.5" />
                )}
                Send Test Email
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
