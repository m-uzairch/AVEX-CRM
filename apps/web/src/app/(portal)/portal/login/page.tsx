'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientLoginFormSchema, ClientLoginFormValues } from '@/features/portal/schemas/portal-schemas';
import { clientLogin } from '@/features/portal/services/portal-service';
import { ShieldCheck, Loader2, KeyRound } from 'lucide-react';

export default function ClientLoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginFormSchema),
    defaultValues: {
      email: 'client@company.com',
      password: 'password123',
    },
  });

  const onSubmit = async (values: ClientLoginFormValues) => {
    try {
      setLoading(true);
      setError(null);
      await clientLogin(values);
      router.push('/portal');
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground font-black text-xl flex items-center justify-center mx-auto shadow-md">
            AV
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AVEX Client Portal</h1>
          <p className="text-xs text-muted-foreground">Sign in to monitor your project progress, invoices, and deliverables.</p>
        </div>

        {/* Login Form Card */}
        <Card className="border-border shadow-md bg-card">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-semibold">Client Login</CardTitle>
            <CardDescription>Enter your account credentials to access your project workspace.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Client Email</label>
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
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact your AVEX Account Manager to reset your client password.'); }} className="text-[10px] text-primary hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 font-bold py-5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Sign In to Client Portal
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Strictly isolated client access. Employee data is protected.</span>
        </div>
      </div>
    </div>
  );
}
