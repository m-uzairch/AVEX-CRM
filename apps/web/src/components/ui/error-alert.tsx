import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorAlert({ title = 'Error', message, className }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        'flex items-start space-x-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="space-y-0.5 text-xs">
        <h5 className="font-semibold text-sm leading-none">{title}</h5>
        <p className="text-destructive/90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
