'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/40',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 shrink-0 shadow-xs">
        {icon}
      </div>
      <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-5 h-9 px-4 text-xs flex items-center space-x-1.5 shadow-xs"
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
}
