'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '@/features/auth/schemas/auth-schemas';
import { AuthService } from '@/features/auth/services/auth-service';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Building2, User, Mail, Lock, ArrowRight, Globe, Store, Layers, CheckCircle2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successEmail, setSuccessEmail] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      businessType: 'DIGITAL',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedBusinessType = watch('businessType');

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessEmail(null);
    try {
      const { user, company, isConfirmed } = await AuthService.registerUser(values);
      if (isConfirmed) {
        setAuth(user, company);
        router.push('/dashboard');
      } else {
        setSuccessEmail(values.email);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to register account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (successEmail) {
    return (
      <Card className="w-full shadow-md border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">Check your email</CardTitle>
          <CardDescription>Verify your account to complete registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h3 className="text-sm font-semibold text-foreground">Verification email sent</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We have sent a verification link to <strong className="text-foreground">{successEmail}</strong>.
              Please click the link in your email to confirm your account before logging in.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/login?email=${encodeURIComponent(successEmail)}`)}
            className="w-full h-10"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">Create Company Workspace</CardTitle>
        <CardDescription>Register your company account and become Company Admin.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name & Company Name Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Full Name</span>
              </label>
              <Input
                placeholder="Alex Carter"
                {...register('fullName')}
                disabled={isLoading}
                className="h-9 text-xs"
              />
              {errors.fullName && <p className="text-[11px] text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Company Name</span>
              </label>
              <Input
                placeholder="Acme Technologies"
                {...register('companyName')}
                disabled={isLoading}
                className="h-9 text-xs"
              />
              {errors.companyName && (
                <p className="text-[11px] text-destructive">{errors.companyName.message}</p>
              )}
            </div>
          </div>

          {/* Business Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Business Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setValue('businessType', 'DIGITAL')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedBusinessType === 'DIGITAL'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Globe className="h-4 w-4 mb-1" />
                <span>Digital</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('businessType', 'PHYSICAL')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedBusinessType === 'PHYSICAL'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Store className="h-4 w-4 mb-1" />
                <span>Physical</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('businessType', 'BOTH')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedBusinessType === 'BOTH'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Layers className="h-4 w-4 mb-1" />
                <span>Both</span>
              </button>
            </div>
            {errors.businessType && (
              <p className="text-[11px] text-destructive">{errors.businessType.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Email Address</span>
            </label>
            <Input
              type="email"
              placeholder="alex@acme.com"
              {...register('email')}
              disabled={isLoading}
              className="h-9 text-xs"
            />
            {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Password</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="h-9 text-xs"
              />
              {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Confirm Password</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
                className="h-9 text-xs"
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-10" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Spinner size="sm" />
                <span>Creating Workspace...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Create Company & Admin Account</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
