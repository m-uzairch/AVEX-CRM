import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col h-full animate-pulse">
          <CardHeader className="p-5 pb-3 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </CardHeader>
          <CardContent className="p-5 pt-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </CardContent>
          <CardFooter className="p-5 pt-3 border-t border-border flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function ProjectTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between space-x-4 py-2 border-b border-border/50 last:border-0">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-28 hidden md:block" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16 hidden sm:block" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}
