'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ContentContainer } from '@/components/layout/content-container';
import { PageHeader } from '@/components/layout/page-header';
import { EmployeeDetailView } from '@/features/employees/components/employee-detail-view';
import { EmployeeDetailResponse } from '@/features/employees/types/employee-types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { UserRole } from '@/features/rbac/types/rbac-types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const user = useAuthStore((state) => state.user);
  const role = (user?.role as UserRole) || 'COMPANY_OWNER';
  const isAdmin = role === 'COMPANY_OWNER' || role === 'ADMIN';

  const [detail, setDetail] = React.useState<EmployeeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDetail = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load employee details.');
      }
      setDetail(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <ContentContainer>
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading employee profile...</p>
        </div>
      </ContentContainer>
    );
  }

  if (error || !detail) {
    return (
      <ContentContainer>
        <div className="p-8 border border-border rounded-lg bg-card text-center space-y-4 max-w-md mx-auto my-12">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 w-fit mx-auto">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Employee Not Found</h3>
            <p className="text-xs text-muted-foreground">
              {error || 'The requested employee profile does not exist or you do not have permission to view it.'}
            </p>
          </div>
          <Link href="/employees">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Employee Directory
            </Button>
          </Link>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title={detail.employee.fullName}
        description={`Employee Profile • ${detail.employee.role}`}
        breadcrumbs={[
          { label: 'Employees', href: '/employees' },
          { label: detail.employee.fullName },
        ]}
      />
      <EmployeeDetailView
        detail={detail}
        isAdmin={isAdmin}
        onRefresh={fetchDetail}
      />
    </ContentContainer>
  );
}
