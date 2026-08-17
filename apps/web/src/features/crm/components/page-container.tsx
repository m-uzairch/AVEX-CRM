'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('flex flex-col space-y-6 p-4 sm:p-6 max-w-7xl mx-auto w-full', className)}>
      {children}
    </div>
  );
}
