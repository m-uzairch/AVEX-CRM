import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">403 - Access Denied</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        You do not have the required role permissions to view this page or perform this action.
      </p>
      <div className="mt-6 flex space-x-3">
        <Link href="/dashboard">
          <Button variant="default">
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
