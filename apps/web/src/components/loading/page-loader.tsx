import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 p-8">
      <Spinner size="lg" />
      <div className="w-full max-w-sm space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
