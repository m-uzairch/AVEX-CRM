'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EmployeeRecord, EmploymentStatus } from '../types/employee-types';
import { MoreVertical, Eye, Edit2, UserX, UserCheck } from 'lucide-react';

interface EmployeeTableProps {
  employees: EmployeeRecord[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit?: (employee: EmployeeRecord) => void;
  onToggleStatus?: (employee: EmployeeRecord) => void;
}

export function EmployeeTable({
  employees,
  isLoading,
  isAdmin,
  onEdit,
  onToggleStatus,
}: EmployeeTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-card border border-border rounded-lg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading employee directory...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-lg">
        <UserX className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No employees found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No employee records matched the selected filters or search query.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: EmploymentStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            On Leave
          </span>
        );
      case 'TERMINATED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Terminated
          </span>
        );
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-xs py-3.5">Employee</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Role / Title</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 hidden md:table-cell">Department</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 hidden lg:table-cell">Contact</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Status</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 hidden sm:table-cell">Hire Date</TableHead>
              <TableHead className="w-12 text-right py-3.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {employees.map((emp) => {
              const initials = emp.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              const menuItems: DropdownMenuItem[] = [
                {
                  label: 'View Profile',
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => router.push(`/employees/${emp.id}`),
                },
              ];

              if (isAdmin && onEdit) {
                menuItems.push({
                  label: 'Edit Employee',
                  icon: <Edit2 className="h-3.5 w-3.5" />,
                  onClick: () => onEdit(emp),
                });
              }

              if (isAdmin && onToggleStatus) {
                menuItems.push({
                  label: emp.employmentStatus === 'ACTIVE' ? 'Deactivate' : 'Reactivate',
                  icon:
                    emp.employmentStatus === 'ACTIVE' ? (
                      <UserX className="h-3.5 w-3.5" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    ),
                  destructive: emp.employmentStatus === 'ACTIVE',
                  onClick: () => onToggleStatus(emp),
                });
              }

              return (
                <TableRow key={emp.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={emp.avatarUrl || undefined}
                        fallback={initials}
                        size="sm"
                        className="border border-border/50"
                      />
                      <div>
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors text-xs flex items-center gap-1.5"
                        >
                          {emp.fullName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground font-mono block">
                          {emp.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-foreground">
                    {emp.role}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {emp.department || '—'}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {emp.phone || '—'}
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(emp.employmentStatus)}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground hidden sm:table-cell font-mono">
                    {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                      items={menuItems}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
