'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientLoginFormSchema, ClientLoginFormValues } from '@/features/portal/schemas/portal-schemas';
import { clientLogin } from '@/features/portal/services/portal-service';
import { ShieldCheck, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/portal';

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: ClientLoginFormValues) => {
    try {
      setLoading(true);
      setError(null);
      await clientLogin(values);
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Logo & Branding */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground font-black text-xl flex items-center justify-center mx-auto shadow-md">
            AV
          </div>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AVEX Client Portal</h1>
        <p className="text-xs text-muted-foreground">
          Sign in to monitor your company&apos;s project progress, invoices, and deliverables.
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-border shadow-lg bg-card">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-base font-semibold">Client Sign In</CardTitle>
          <CardDescription>Enter your client credentials to access your secure workspace.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs font-medium flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Client Email Address</label>
              <Input
                placeholder="client@company.com"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-foreground">Password</label>
                <span className="text-[10px] text-muted-foreground">
                  Contact manager for reset
                </span>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2 font-bold py-5 mt-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {loading ? 'Authenticating...' : 'Sign In to Client Portal'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security notice */}
      <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Strictly isolated client access. Internal data protected.</span>
      </div>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4 font-sans">
      <React.Suspense fallback={
        <div className="py-12 text-center text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading...
        </div>
      }>
        <LoginFormContent />
      </React.Suspense>
    </div>
  );
}
