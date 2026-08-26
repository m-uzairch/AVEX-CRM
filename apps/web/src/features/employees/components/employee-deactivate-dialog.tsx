'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmployeeRecord } from '../types/employee-types';
import { Loader2 } from 'lucide-react';

interface EmployeeDeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeRecord | null;
  onConfirmed: () => void;
}

export function EmployeeDeactivateDialog({
  open,
  onOpenChange,
  employee,
  onConfirmed,
}: EmployeeDeactivateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!employee) return null;

  const isDeactivating = employee.employmentStatus === 'ACTIVE';

  const handleAction = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newStatus = isDeactivating ? 'TERMINATED' : 'ACTIVE';
      const res = await fetch(`/api/employees/${employee.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update employee status.');
      }

      onOpenChange(false);
      onConfirmed();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isDeactivating ? 'Deactivate Employee' : 'Reactivate Employee'}
      description={
        isDeactivating
          ? `Are you sure you want to deactivate ${employee.fullName}? Their status will be set to Terminated. Associated tasks, historical attendance records, and project assignments will remain preserved.`
          : `Are you sure you want to reactivate ${employee.fullName}? Their status will be returned to Active.`
      }
    >
      {error && (
        <div className="p-3 mb-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant={isDeactivating ? 'destructive' : 'default'}
          size="sm"
          onClick={handleAction}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          {isDeactivating ? 'Deactivate' : 'Reactivate'}
        </Button>
      </div>
    </Dialog>
  );
}
