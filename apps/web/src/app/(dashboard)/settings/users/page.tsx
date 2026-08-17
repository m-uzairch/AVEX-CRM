'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { PermissionGuard } from '@/features/rbac/components/permission-guard';
import { UserManagementService } from '@/features/rbac/services/user-management-service';
import { UserManagementRecord, UserRole } from '@/features/rbac/types/rbac-types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { UserPlus, Search, UserCheck, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserManagementPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = React.useState<UserManagementRecord[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = React.useState('');
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<UserRole>('EMPLOYEE');

  const loadUsers = React.useCallback(async () => {
    const list = await UserManagementService.getUsers();
    setUsers(list);
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await UserManagementService.inviteUser({
        fullName: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      setSuccessMsg(`Invitation sent to ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('EMPLOYEE');
      loadUsers();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send invitation.');
    }
  };

  const handleToggleStatus = async (user: UserManagementRecord) => {
    setErrorMsg(null);
    try {
      await UserManagementService.toggleUserStatus(user.id);
      loadUsers();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update user status.');
    }
  };

  const handleRoleChange = async (user: UserManagementRecord, newRole: UserRole) => {
    setErrorMsg(null);
    try {
      await UserManagementService.updateUserRole(user.id, newRole);
      loadUsers();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update user role.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleVariantMap: Record<UserRole, 'default' | 'secondary' | 'warning' | 'outline'> = {
    COMPANY_OWNER: 'default',
    ADMIN: 'secondary',
    EMPLOYEE: 'warning',
    CLIENT: 'outline',
  };

  return (
    <PermissionGuard
      permission="MANAGE_USERS"
      fallback={
        <ContentContainer>
          <div className="flex flex-col items-center justify-center p-12 text-center border border-border rounded-lg bg-card">
            <ShieldAlert className="h-12 w-12 text-destructive mb-3" />
            <h2 className="text-lg font-bold">Access Restricted</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              You must have Company Owner or Admin permissions to access the User Management page.
            </p>
          </div>
        </ContentContainer>
      }
    >
      <ContentContainer>
        <PageHeader
          title="User Management & Team Members"
          description="Manage workspace users, assign role permissions, and invite team members."
          breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Users' }]}
          actions={
            <Button onClick={() => setIsInviteOpen(true)} size="sm">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite Team Member
            </Button>
          }
        />

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 rounded-md bg-success/15 p-3 text-xs text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Active Members & Invitations</CardTitle>
              <CardDescription>Company workspace users and permission status.</CardDescription>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search member name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.email === u.email;
                  const isOwner = u.role === 'COMPANY_OWNER';
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar fallback={u.fullName} size="sm" />
                          <div>
                            <div className="font-semibold text-sm flex items-center space-x-1.5">
                              <span>{u.fullName}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOwner || isSelf ? (
                          <Badge variant={roleVariantMap[u.role]}>{u.role.replace('_', ' ')}</Badge>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                            className="bg-background border border-border rounded-md px-2 py-1 text-xs font-medium focus:outline-hidden cursor-pointer"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="CLIENT">Client</option>
                          </select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.status === 'ACTIVE'
                              ? 'success'
                              : u.status === 'PENDING'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isOwner && !isSelf && (
                          <Button
                            variant={u.status === 'ACTIVE' ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => handleToggleStatus(u)}
                            className="h-7 text-xs"
                          >
                            {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invite User Dialog */}
        <Dialog
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          title="Invite Team Member"
          description="Send an invitation link to a new team member or client."
        >
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <Input
                placeholder="Sarah Jenkins"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="sarah@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Assigned Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="ADMIN">Admin — Full operational access</option>
                <option value="EMPLOYEE">Employee — Assigned tasks & attendance</option>
                <option value="CLIENT">Client — Client portal access only</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <UserCheck className="h-4 w-4 mr-1" />
                Send Invitation
              </Button>
            </div>
          </form>
        </Dialog>
      </ContentContainer>
    </PermissionGuard>
  );
}
