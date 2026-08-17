import * as React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-success shrink-0" />,
  error: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning shrink-0" />,
  info: <Info className="h-4 w-4 text-primary shrink-0" />,
};

const borderMap: Record<ToastType, string> = {
  success: 'border-success/30 bg-card',
  error: 'border-destructive/30 bg-card',
  warning: 'border-warning/30 bg-card',
  info: 'border-primary/30 bg-card',
};

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        'flex items-start space-x-3 w-80 max-w-full p-3.5 rounded-lg border shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-200',
        borderMap[toast.type],
      )}
    >
      <div className="mt-0.5">{iconMap[toast.type]}</div>
      <div className="flex-1 space-y-0.5 text-xs">
        <h5 className="font-semibold text-foreground">{toast.title}</h5>
        {toast.message && <p className="text-muted-foreground leading-normal">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
        type="button"
        aria-label="Dismiss toast"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
