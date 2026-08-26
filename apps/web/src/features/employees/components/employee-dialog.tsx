'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmployeeRecord, EmploymentStatus } from '../types/employee-types';
import { employeeCreateSchema } from '../schemas/employee-schemas';
import { Loader2 } from 'lucide-react';

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeRecord | null;
  onSaved: () => void;
}

export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSaved,
}: EmployeeDialogProps) {
  const isEditing = Boolean(employee);

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [employmentStatus, setEmploymentStatus] = React.useState<EmploymentStatus>('ACTIVE');
  const [hireDate, setHireDate] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (employee) {
      setFullName(employee.fullName || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setRole(employee.role || '');
      setDepartment(employee.department || '');
      setEmploymentStatus(employee.employmentStatus || 'ACTIVE');
      setHireDate(
        employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : ''
      );
      setAvatarUrl(employee.avatarUrl || '');
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setRole('');
      setDepartment('');
      setEmploymentStatus('ACTIVE');
      setHireDate(new Date().toISOString().split('T')[0]);
      setAvatarUrl('');
    }
    setErrors({});
    setApiError(null);
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    const payload = {
      fullName,
      email,
      phone: phone || null,
      role,
      department: department || null,
      employmentStatus,
      hireDate: hireDate ? new Date(hireDate).toISOString() : null,
      avatarUrl: avatarUrl || null,
    };

    const validation = employeeCreateSchema.safeParse(payload);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errMap[String(err.path[0])] = err.message;
        }
      });
      setErrors(errMap);
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isEditing ? `/api/employees/${employee?.id}` : '/api/employees';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save employee record.');
      }

      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? 'Edit Employee Profile' : 'Add New Employee'}
      description={
        isEditing
          ? 'Update employment details, department, and contact information.'
          : 'Add an employee to your company directory. Changes are scoped to your company.'
      }
    >
      {apiError && (
        <div className="p-3 mb-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded text-xs">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-8 text-xs"
            />
            {errors.fullName && (
              <p className="text-[10px] text-rose-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 text-xs font-mono"
            />
            {errors.email && (
              <p className="text-[10px] text-rose-500">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">
              Role / Job Title <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. Lead Designer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-8 text-xs"
            />
            {errors.role && (
              <p className="text-[10px] text-rose-500">{errors.role}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">
              Department
            </label>
            <Input
              placeholder="e.g. Engineering, Sales, HR"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">Phone</label>
            <Input
              placeholder="+1 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">
              Employment Status
            </label>
            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
              className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">Hire Date</label>
            <Input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">Avatar URL</label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="h-8 text-xs"
            />
            {errors.avatarUrl && (
              <p className="text-[10px] text-rose-500">{errors.avatarUrl}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
