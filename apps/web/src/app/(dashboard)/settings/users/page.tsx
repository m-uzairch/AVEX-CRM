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
import {
  UserPlus,
  Search,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Key,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

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
  const [tempPassword, setTempPassword] = React.useState('');
  const [createdCredentials, setCreatedCredentials] = React.useState<{
    name: string;
    email: string;
    role: string;
    password?: string;
    loginUrl: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const loadUsers = React.useCallback(async () => {
    const list = await UserManagementService.getUsers();
    setUsers(list);
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(pwd);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const assignedPassword = tempPassword || 'Password123!';

      await UserManagementService.inviteUser({
        fullName: inviteName,
        email: inviteEmail,
        role: inviteRole,
        password: assignedPassword,
      });

      const loginUrl =
        inviteRole === 'CLIENT'
          ? `${window.location.origin}/portal/login`
          : `${window.location.origin}/login`;

      setCreatedCredentials({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        password: assignedPassword,
        loginUrl,
      });

      setSuccessMsg(`Created user account for ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('EMPLOYEE');
      setTempPassword('');
      loadUsers();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send invitation.');
    }
  };

  const copyCredentials = () => {
    if (!createdCredentials) return;
    const text = `AVEX CRM Login Credentials\nName: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nRole: ${createdCredentials.role}\nPassword: ${createdCredentials.password}\nLogin URL: ${createdCredentials.loginUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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
            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-bold">Access Restricted</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You do not have permission to view or manage user accounts. Contact your Company Owner or Administrator.
            </p>
          </div>
        </ContentContainer>
      }
    >
      <ContentContainer>
        <PageHeader
          title="User & Credential Management"
          description="Manage workspace users, assign role permissions, and generate login credentials for team members & clients."
          breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Users' }]}
          actions={
            <Button size="sm" onClick={() => setIsInviteOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Create / Invite User
            </Button>
          }
        />

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-destructive/15 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Credentials Card Display after Creation */}
        {createdCredentials && (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">User Credentials Generated</CardTitle>
                </div>
                <Button size="sm" variant="outline" onClick={copyCredentials} className="h-8 text-xs">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy Credentials
                    </>
                  )}
                </Button>
              </div>
              <CardDescription className="text-xs">
                Provide these credentials to the user to sign in to their designated portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-background/80 p-3 rounded-lg border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-medium text-foreground">{createdCredentials.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Role</span>
                  <Badge variant={roleVariantMap[createdCredentials.role as UserRole]} className="mt-0.5 text-[10px]">
                    {createdCredentials.role}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Password</span>
                  <span className="font-mono text-foreground font-semibold">{createdCredentials.password}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Portal URL</span>
                  <a
                    href={createdCredentials.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center mt-0.5 truncate"
                  >
                    <span>{createdCredentials.loginUrl.replace('http://', '')}</span>
                    <ExternalLink className="h-3 w-3 ml-1 shrink-0" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold">Workspace Members</CardTitle>
                <CardDescription className="text-xs">
                  {users.length} total active and invited user accounts.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined / Invited</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => {
                  const isOwner = u.role === 'COMPANY_OWNER';
                  const isSelf = u.id === currentUser?.id;
                  const initials = u.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar fallback={initials} size="sm" />
                          <div>
                            <div className="font-semibold text-xs text-foreground flex items-center space-x-1.5">
                              <span>{u.fullName}</span>
                              {isSelf && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                                  You
                                </Badge>
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

        {/* Invite / Create User Dialog */}
        <Dialog
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          title="Create / Invite User"
          description="Assign a role and configure credentials for a team member or client."
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
                <option value="ADMIN">Admin — Full CRM operations & user control</option>
                <option value="EMPLOYEE">Employee — Tasks, attendance & project delivery</option>
                <option value="CLIENT">Client — Dedicated Client Portal access (/portal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Temporary Password (Optional)</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-primary hover:underline"
                >
                  Generate Random
                </button>
              </div>
              <Input
                placeholder="Auto-generated if left empty"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="rounded-md bg-muted p-2.5 text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Sign-In Destination:</p>
              {inviteRole === 'CLIENT' ? (
                <p>Clients sign in via the Client Portal at <code className="text-primary font-mono">/portal/login</code>.</p>
              ) : (
                <p>Staff/Admins sign in via the main portal at <code className="text-primary font-mono">/login</code>.</p>
              )}
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
                Create Account & Credentials
              </Button>
            </div>
          </form>
        </Dialog>
      </ContentContainer>
    </PermissionGuard>
  );
}
