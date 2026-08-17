'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/features/auth/schemas/auth-schemas';
import { AuthService } from '@/features/auth/services/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await AuthService.requestPasswordReset(values.email);
      setIsSuccess(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">Recover Password</CardTitle>
        <CardDescription>Enter your account email to receive a password reset link.</CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <h3 className="text-sm font-semibold text-foreground">Check your inbox</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We sent a password recovery link to your email address. Please follow the instructions to create a new password.
            </p>
          </div>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full h-10">
              <ArrowLeft className="h-4 w-4 mr-2" /> Return to Login
            </Button>
          </Link>
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
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Account Email</span>
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Spinner size="sm" />
                  <span>Sending Reset Link...</span>
                </span>
              ) : (
                <span>Send Password Reset Email</span>
              )}
            </Button>

            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center space-x-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
