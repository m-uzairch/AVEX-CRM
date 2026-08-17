import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="default">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
