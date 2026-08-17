'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Something went wrong!</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        An unexpected system error occurred. Our team has been notified.
      </p>
      <div className="mt-6 flex space-x-3">
        <Button onClick={() => reset()} variant="default">
          Try Again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Return Home
        </Button>
      </div>
    </div>
  );
}
