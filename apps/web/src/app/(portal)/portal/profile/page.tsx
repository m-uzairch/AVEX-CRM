'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientProfileFormSchema, ClientProfileFormValues } from '@/features/portal/schemas/portal-schemas';
import { fetchClientMe, updateClientProfile } from '@/features/portal/services/portal-service';
import { ClientAccount } from '@/features/portal/types/portal-types';
import { User, ShieldCheck, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function ClientProfilePage() {
  const [client, setClient] = React.useState<ClientAccount | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  React.useEffect(() => {
    fetchClientMe()
      .then((c) => {
        setClient(c);
        reset({
          name: c.name,
          email: c.email,
          phone: c.phone || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values: ClientProfileFormValues) => {
    try {
      setSaving(true);
      setSuccess(false);
      const updated = await updateClientProfile(values);
      setClient(updated);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !client) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Loading profile settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Profile Settings</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your contact information and security preferences.
        </p>
      </div>

      <Card>
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-base font-semibold">Contact & Personal Info</CardTitle>
          <CardDescription>Update your name, email, and phone number for project updates.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {success && (
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Company Name (Read Only)</label>
              <Input value={client.customer?.companyName || '—'} disabled className="bg-muted font-bold" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Full Name *</label>
              <Input {...register('name')} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Email Address *</label>
              <Input type="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Phone Number</label>
              <Input {...register('phone')} placeholder="+1 (555) 000-0000" />
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="submit" disabled={saving} className="gap-2 font-bold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-muted-foreground flex items-center space-x-3">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
        <span>Your client credentials have strict tenant isolation enabled. Only authorized projects are visible.</span>
      </div>
    </div>
  );
}
