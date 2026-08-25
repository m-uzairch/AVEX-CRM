'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SettingsService } from '../services/settings-service';
import { SecuritySettings } from '../types/settings-types';
import { Shield, CheckCircle2, AlertCircle, Loader2, KeyRound, Monitor, Smartphone, Laptop } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export function SecuritySettingsCard() {
  const { success, error: toastError } = useToast();
  const [security, setSecurity] = React.useState<SecuritySettings | null>(null);

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [isLoading, setIsLoading] = React.useState(true);
  const [isChangingPwd, setIsChangingPwd] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await SettingsService.getSecuritySettings();
        setSecurity(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load security settings');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPwd(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await SettingsService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      success('Password changed', res.message);
      setStatusMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.message || 'Failed to update password.';
      setErrorMsg(msg);
      toastError('Password update failed', msg);
    } finally {
      setIsChangingPwd(false);
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
      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">Update Account Password</CardTitle>
              <CardDescription className="text-xs">
                Ensure your account is protected with a strong, distinct alphanumeric passphrase.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handlePasswordChange}>
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Current Password</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-border pt-4">
            <Button type="submit" size="sm" disabled={isChangingPwd}>
              {isChangingPwd && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Active Sessions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">Active Login Sessions</CardTitle>
              <CardDescription className="text-xs">
                Devices and browsers currently authenticated with your account.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {security?.sessions.map((sess) => (
            <div
              key={sess.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
            >
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {sess.os.includes('iOS') || sess.os.includes('Android') ? (
                    <Smartphone className="h-5 w-5" />
                  ) : sess.os.includes('Mac') ? (
                    <Laptop className="h-5 w-5" />
                  ) : (
                    <Monitor className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-foreground">
                      {sess.browser} on {sess.os}
                    </span>
                    {sess.isCurrent && (
                      <Badge variant="success" className="text-[9px] py-0 px-1.5">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    IP: {sess.deviceIp} • Active {new Date(sess.lastActivity).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
