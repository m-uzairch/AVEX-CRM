'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormValues } from '@/features/auth/schemas/auth-schemas';
import { AuthService } from '@/features/auth/services/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await AuthService.resetPassword(values.password);
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">Create New Password</CardTitle>
        <CardDescription>Enter and confirm your new secure account password.</CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <h3 className="text-sm font-semibold text-foreground">Password updated</h3>
            <p className="text-xs text-muted-foreground">
              Your password has been successfully reset. Redirecting you to login...
            </p>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="flex items-center space-x-2 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>New Password</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="h-10 text-sm"
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Confirm New Password</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
                className="h-10 text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Spinner size="sm" />
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Update Password</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground text-center">
              Cancel & Return to Sign In
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
