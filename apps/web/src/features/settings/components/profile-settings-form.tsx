'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SettingsService } from '../services/settings-service';
import { UserProfileSettings } from '../types/settings-types';
import { User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export function ProfileSettingsForm() {
  const { success, error: toastError } = useToast();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [profile, setProfile] = React.useState<UserProfileSettings | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [avatar, setAvatar] = React.useState('');

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await SettingsService.getProfile();
        setProfile(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setJobTitle(data.jobTitle || '');
        setBio(data.bio || '');
        setAvatar(data.avatar || '');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load profile');
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
      const updated = await SettingsService.updateProfile({
        fullName,
        phone,
        jobTitle,
        bio,
        avatar,
      });
      setProfile(updated);
      updateUser({ fullName: updated.fullName });
      success('Profile updated', 'Your personal details have been saved.');
      setStatusMsg('Profile changes saved successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to save profile changes.';
      setErrorMsg(msg);
      toastError('Save failed', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'AC';

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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">My Profile</CardTitle>
              <CardDescription className="text-xs">
                Manage your public personal details and contact information.
              </CardDescription>
            </div>
          </div>
          {profile && (
            <Badge variant="outline" className="text-[11px] font-mono">
              {profile.role.replace('_', ' ')}
            </Badge>
          )}
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

          {/* Avatar Section */}
          <div className="flex items-center space-x-4 p-3 rounded-lg border border-border bg-muted/40">
            <Avatar fallback={initials} size="lg" />
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-foreground">Avatar Image URL</label>
              <Input
                placeholder="https://images.unsplash.com/photo-..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Account Email</label>
              <Input
                value={profile?.email || ''}
                disabled
                className="h-9 text-xs bg-muted text-muted-foreground cursor-not-allowed"
                title="Email is governed by authentication rules"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Phone Number</label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Job Title / Role</label>
              <Input
                placeholder="Senior Project Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Bio / About</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your team about your focus and background..."
              className="w-full bg-background border border-border rounded-md p-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-border pt-4">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Save Profile Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
