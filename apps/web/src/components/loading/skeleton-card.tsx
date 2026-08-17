import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function SkeletonCard() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  );
}
