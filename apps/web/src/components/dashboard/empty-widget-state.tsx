import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyWidgetStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function EmptyWidgetState({ icon, title, description, className }: EmptyWidgetStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-md border border-dashed border-border bg-card/40',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
        {icon}
      </div>
      <h4 className="text-xs font-semibold text-foreground">{title}</h4>
      <p className="mt-1 text-[11px] text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
