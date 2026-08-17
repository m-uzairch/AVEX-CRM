'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/features/auth/schemas/auth-schemas';
import { AuthService } from '@/features/auth/services/auth-service';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Lock, Mail, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const prefilledEmail = searchParams.get('email') || '';

  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isUnconfirmed, setIsUnconfirmed] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefilledEmail,
      password: '',
    },
  });

  const emailValue = watch('email');

  const handleResendVerification = async () => {
    if (!emailValue) {
      setResendStatus('Please enter your email address first.');
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    try {
      await AuthService.resendVerificationEmail(emailValue);
      setResendStatus('Verification email sent! Please check your inbox.');
    } catch (err) {
      setResendStatus(err instanceof Error ? err.message : 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsUnconfirmed(false);
    setResendStatus(null);
    try {
      const user = await AuthService.loginUser(values);
      setAuth(user, {
        id: user.companyId,
        name: user.companyName,
        businessType: user.businessType,
        createdAt: user.createdAt,
      });
      router.push(redirectTo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setErrorMsg(msg);
      if (msg.toLowerCase().includes('email not confirmed')) {
        setIsUnconfirmed(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">Sign in to AVEX CRM</CardTitle>
        <CardDescription>Enter your credentials to access your company workspace.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="flex flex-col space-y-2 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {isUnconfirmed && (
                <div className="pt-1 border-t border-destructive/20 flex flex-col space-y-2">
                  <p className="text-[11px] text-destructive/90">
                    Your email address has not been confirmed yet. Please verify your email before logging in.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="h-8 text-xs self-start bg-background text-foreground hover:bg-accent"
                  >
                    {isResending ? (
                      <span className="flex items-center space-x-1">
                        <Spinner size="sm" />
                        <span>Sending...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        <span>Resend Verification Email</span>
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {resendStatus && (
            <div className="flex items-center space-x-2 rounded-md bg-emerald-500/15 p-3 text-xs text-emerald-500">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Email Address</span>
            </label>
            <Input
              type="email"
              placeholder="alex@company.com"
              {...register('email')}
              disabled={isLoading}
              className="h-10 text-sm"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Password</span>
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              className="h-10 text-sm"
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-10" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Spinner size="sm" />
                <span>Signing in...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Don&apos;t have a workspace yet?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
      <LoginForm />
    </React.Suspense>
  );
}
