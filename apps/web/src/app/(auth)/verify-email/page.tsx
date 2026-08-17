'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MailCheck, RefreshCw, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const [isResent, setIsResent] = React.useState(false);

  const handleResend = () => {
    setIsResent(true);
    setTimeout(() => setIsResent(false), 5000);
  };

  return (
    <Card className="w-full shadow-md border-border text-center">
      <CardHeader className="space-y-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <MailCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Verify Your Email</CardTitle>
        <CardDescription>
          We sent a verification link to your registered email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please open the email link to verify your identity and activate your company workspace. If you cannot find the email, check your spam or junk folder.
        </p>

        {isResent && (
          <div className="p-3 rounded-md bg-success/15 text-xs text-success font-medium">
            Verification email has been resent to your inbox!
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 pt-2">
        <Button onClick={handleResend} variant="outline" className="w-full h-10" disabled={isResent}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {isResent ? 'Email Sent' : 'Resend Verification Email'}
        </Button>
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center space-x-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
