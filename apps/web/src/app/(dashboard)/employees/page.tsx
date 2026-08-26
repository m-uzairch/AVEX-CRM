'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { EmployeeTable } from '@/features/employees/components/employee-table';
import { EmployeeDialog } from '@/features/employees/components/employee-dialog';
import { EmployeeDeactivateDialog } from '@/features/employees/components/employee-deactivate-dialog';
import { EmployeeRecord } from '@/features/employees/types/employee-types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { UserRole } from '@/features/rbac/types/rbac-types';
import { Plus, Search, RefreshCw, ShieldAlert } from 'lucide-react';

export default function EmployeesPage() {
  const user = useAuthStore((state) => state.user);
  const role = (user?.role as UserRole) || 'COMPANY_OWNER';
  const isAdmin = role === 'COMPANY_OWNER' || role === 'ADMIN';

  const [employees, setEmployees] = React.useState<EmployeeRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);

  const [search, setSearch] = React.useState('');
  const [department, setDepartment] = React.useState('ALL');
  const [status, setStatus] = React.useState('ALL');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<EmployeeRecord | null>(null);
  const [statusEmployee, setStatusEmployee] = React.useState<EmployeeRecord | null>(null);

  const fetchEmployees = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (department !== 'ALL') params.set('department', department);
      if (status !== 'ALL') params.set('status', status);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch employee records.');
      }

      setEmployees(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  }, [search, department, status, page, pageSize]);

  React.useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    } else {
      setIsLoading(false);
    }
  }, [fetchEmployees, isAdmin]);

  // If regular employee without admin privileges, show self-profile portal message
  if (!isAdmin) {
    return (
      <ContentContainer>
        <PageHeader
          title="Employee Directory"
          description="View employee records, department structures, and staff profiles."
          breadcrumbs={[{ label: 'Employees' }]}
        />
        <div className="p-8 border border-border rounded-lg bg-card text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 w-fit mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Employee Profile Access</h3>
            <p className="text-xs text-muted-foreground">
              Only company administrators can browse the complete employee directory. You can
              access and review your own assigned profile, tasks, and attendance via your user account.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (user?.id) {
                window.location.href = `/employees/${user.id}`;
              }
            }}
          >
            View My Profile
          </Button>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Employee Directory"
        description="Manage company employees, job roles, department assignments, and staff profiles."
        breadcrumbs={[{ label: 'Employees' }]}
        actions={
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 text-xs shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            Add Employee
          </Button>
        }
      />

      <div className="space-y-4">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Department Filter */}
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by department"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by employment status"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEmployees()}
              className="h-8 w-8 p-0"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Employee Table */}
        <EmployeeTable
          employees={employees}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onEdit={(emp) => setEditingEmployee(emp)}
          onToggleStatus={(emp) => setStatusEmployee(emp)}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} employees
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddOpen && (
        <EmployeeDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSaved={fetchEmployees}
        />
      )}

      {editingEmployee && (
        <EmployeeDialog
          open={Boolean(editingEmployee)}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
          employee={editingEmployee}
          onSaved={fetchEmployees}
        />
      )}

      {statusEmployee && (
        <EmployeeDeactivateDialog
          open={Boolean(statusEmployee)}
          onOpenChange={(open) => !open && setStatusEmployee(null)}
          employee={statusEmployee}
          onConfirmed={fetchEmployees}
        />
      )}
    </ContentContainer>
  );
}
