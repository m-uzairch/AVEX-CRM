import * as React from 'react';
import { cn } from '@/lib/utils';

export type ContentContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function ContentContainer({ className, children, ...props }: ContentContainerProps) {
  return (
    <div className={cn('max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6', className)} {...props}>
      {children}
    </div>
  );
}
