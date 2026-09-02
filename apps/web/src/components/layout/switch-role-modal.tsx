'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { UserRole } from '@/features/rbac/types/rbac-types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface SwitchRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetRole?: UserRole;
}

const roleDefaults: Record<UserRole, { email: string; label: string }> = {
  COMPANY_OWNER: { email: 'admin@avexcrm.com', label: 'Company Owner' },
  ADMIN: { email: 'sarah@avexcrm.com', label: 'Administrator' },
  EMPLOYEE: { email: 'marcus@avexcrm.com', label: 'Employee' },
  CLIENT: { email: 'client@nexuscorp.com', label: 'Client Portal' },
};

export function SwitchRoleModal({ isOpen, onClose, initialTargetRole = 'ADMIN' }: SwitchRoleModalProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [targetRole, setTargetRole] = React.useState<UserRole>(initialTargetRole);
  const [email, setEmail] = React.useState(roleDefaults[initialTargetRole]?.email || '');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTargetRole(initialTargetRole);
      setEmail(roleDefaults[initialTargetRole]?.email || '');
      setPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTargetRole]);

  const handleRoleChange = (newRole: UserRole) => {
    setTargetRole(newRole);
    setEmail(roleDefaults[newRole]?.email || '');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (targetRole === 'CLIENT') {
        const res = await fetch('/api/portal/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Invalid client portal email or password.');
        }

        setSuccessMsg('Authenticated successfully. Redirecting to Client Portal...');
        setTimeout(() => {
          onClose();
          router.push('/portal');
        }, 600);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Invalid email or password.');
        }

        const data = await res.json();
        const user = data.user;

        setAuth(user, {
          id: user.companyId,
          name: user.companyName,
          businessType: user.businessType,
          createdAt: user.createdAt,
        });

        setSuccessMsg(`Authenticated as ${user.role}. Updating workspace...`);
        setTimeout(() => {
          onClose();
          router.push('/dashboard');
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Role Authentication"
      description="Enter credentials for the target account to authenticate and switch access."
      className="max-w-md"
    >
      <form onSubmit={handleSwitchSubmit} className="space-y-4 pt-1">
        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 rounded-md bg-emerald-500/15 p-3 text-xs text-emerald-500">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Role Target Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Target Role</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(['COMPANY_OWNER', 'ADMIN', 'EMPLOYEE', 'CLIENT'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all ${
                  targetRole === r
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span>{roleDefaults[r].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Account Email</span>
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={isLoading}
            required
            className="h-9 text-xs"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center space-x-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Account Password</span>
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            disabled={isLoading}
            required
            className="h-9 text-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              router.push(targetRole === 'CLIENT' ? '/portal/login' : '/login');
            }}
            disabled={isLoading}
            className="text-xs"
          >
            Go to Login Page
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="text-xs">
              {isLoading ? (
                <span className="flex items-center space-x-1.5">
                  <Spinner size="sm" />
                  <span>Verifying...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1">
                  <span>Authenticate & Switch</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
