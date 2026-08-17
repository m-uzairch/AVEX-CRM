'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ROLE_PERMISSIONS } from '@/features/rbac/config/rbac-matrix';
import { UserRole, Permission } from '@/features/rbac/types/rbac-types';
import { Check, X, Shield } from 'lucide-react';

const allPermissions: { key: Permission; label: string; group: string }[] = [
  { key: 'MANAGE_COMPANY', label: 'Manage Company Profile', group: 'Administration' },
  { key: 'MANAGE_BILLING', label: 'Manage Subscription & Billing', group: 'Administration' },
  { key: 'MANAGE_USERS', label: 'User & Role Management', group: 'Administration' },
  { key: 'MANAGE_SETTINGS', label: 'Company Settings', group: 'Administration' },
  { key: 'MANAGE_CRM', label: 'CRM & Customer Deals', group: 'Operations' },
  { key: 'MANAGE_PROJECTS', label: 'Projects & Tasks', group: 'Operations' },
  { key: 'MANAGE_EMPLOYEES', label: 'Employee Directory', group: 'Operations' },
  { key: 'MANAGE_ATTENDANCE', label: 'Attendance Tracking', group: 'Operations' },
  { key: 'MANAGE_INVOICES', label: 'Invoices & Billing', group: 'Finance' },
  { key: 'MANAGE_INVENTORY', label: 'Inventory & Products', group: 'Logistics' },
  { key: 'MANAGE_REPORTS', label: 'Reports & Business Intelligence', group: 'Analytics' },
  { key: 'VIEW_CLIENT_PORTAL', label: 'Client Portal View', group: 'Portal' },
];

export default function RolesPage() {
  const roles: UserRole[] = ['COMPANY_OWNER', 'ADMIN', 'EMPLOYEE', 'CLIENT'];

  return (
    <ContentContainer>
      <PageHeader
        title="Roles & Permissions Matrix"
        description="Overview of access privileges and module permissions assigned to each system role."
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Roles' }]}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">Permission Assignment Matrix</CardTitle>
              <CardDescription>
                Deterministic access control rules governing system capabilities.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Permission Token</TableHead>
                {roles.map((r) => (
                  <TableHead key={r} className="text-center font-bold">
                    <Badge
                      variant={
                        r === 'COMPANY_OWNER'
                          ? 'default'
                          : r === 'ADMIN'
                          ? 'secondary'
                          : r === 'EMPLOYEE'
                          ? 'warning'
                          : 'outline'
                      }
                    >
                      {r.replace('_', ' ')}
                    </Badge>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPermissions.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="font-medium">
                    <div>{p.label}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{p.key}</div>
                  </TableCell>
                  {roles.map((r) => {
                    const isGranted = ROLE_PERMISSIONS[r]?.includes(p.key);
                    return (
                      <TableCell key={r} className="text-center">
                        {isGranted ? (
                          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                            <X className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ContentContainer>
  );
}
