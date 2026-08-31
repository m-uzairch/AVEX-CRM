'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { AuthService } from '@/features/auth/services/auth-service';
import { UserRole } from '@/features/rbac/types/rbac-types';
import { Menu, User, Settings, LogOut, Shield } from 'lucide-react';
import { NotificationCenterDropdown } from '@/components/notifications/notification-center-dropdown';
import { GlobalSearchPopover } from '@/components/search/global-search-popover';

export interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/crm': 'CRM & Customers',
  '/projects': 'Project Management',
  '/employees': 'Employee Directory',
  '/attendance': 'Attendance & Shifts',
  '/quotations': 'Quotations & Estimates',
  '/invoices': 'Invoices & Payments',
  '/finance': 'Finance & Treasury Hub',
  '/payments': 'Payment Tracking & Receipts',
  '/payments/outstanding': 'Outstanding Invoices & Aging',
  '/expenses': 'Expense Management System',
  '/expenses/vendors': 'Vendor Directory',
  '/expenses/approvals': 'Expense Approval Queue',
  '/financial-dashboard': 'Financial Dashboard & Performance',
  '/inventory': 'Inventory & Products',
  '/reports': 'Reports & Analytics',
  '/calendar': 'Calendar & Events',
  '/notifications': 'Notification Center',
  '/settings': 'Company Settings',
  '/settings/users': 'User Management',
  '/settings/roles': 'Roles & Permissions',
  '/unauthorized': '403 Access Denied',
};

export function TopNavbar({ onOpenMobileSidebar }: TopNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] || 'Dashboard';

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  const activeRole: UserRole = (user?.role as UserRole) || 'COMPANY_OWNER';

  const handleRoleSwitch = (newRole: UserRole) => {
    updateUser({ role: newRole });
    if (newRole === 'CLIENT') {
      router.push('/portal');
    } else if (pathname.startsWith('/portal')) {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    await AuthService.logoutUser();
    logout();
    router.push('/login');
  };

  const userMenuItems = [
    {
      label: 'Profile Settings',
      icon: <User className="h-4 w-4" />,
      onClick: () => router.push('/settings'),
    },
    {
      label: 'User Management',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => router.push('/settings/users'),
    },
    {
      label: 'Sign Out',
      icon: <LogOut className="h-4 w-4" />,
      destructive: true,
      onClick: handleLogout,
    },
  ];

  const roleVariantMap: Record<UserRole, 'default' | 'secondary' | 'warning' | 'outline'> = {
    COMPANY_OWNER: 'default',
    ADMIN: 'secondary',
    EMPLOYEE: 'warning',
    CLIENT: 'outline',
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'AC';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between rounded-xl border border-border/80 bg-card/90 backdrop-blur-md dark:bg-card/85 shadow-subtle px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
          type="button"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-foreground hidden sm:block">{title}</h1>
      </div>

      {/* Global Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <GlobalSearchPopover />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Role Simulator Switcher for Testing */}
        <div className="hidden sm:flex items-center space-x-1.5 border border-border rounded-lg bg-card p-1">
          <Shield className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          <select
            value={activeRole}
            onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
            aria-label="Simulate user role"
          >
            <option value="COMPANY_OWNER" className="bg-card text-card-foreground dark:bg-neutral-900 dark:text-neutral-100 font-medium">Company Owner</option>
            <option value="ADMIN" className="bg-card text-card-foreground dark:bg-neutral-900 dark:text-neutral-100 font-medium">Admin</option>
            <option value="EMPLOYEE" className="bg-card text-card-foreground dark:bg-neutral-900 dark:text-neutral-100 font-medium">Employee</option>
            <option value="CLIENT" className="bg-card text-card-foreground dark:bg-neutral-900 dark:text-neutral-100 font-medium">Client Portal</option>
          </select>
        </div>

        {/* Role Badge */}
        <Badge variant={roleVariantMap[activeRole]} className="hidden lg:inline-flex text-[10px]">
          {activeRole.replace('_', ' ')}
        </Badge>

        {/* Notifications Dropdown */}
        <NotificationCenterDropdown />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Dropdown */}
        <DropdownMenu
          trigger={
            <div className="flex items-center space-x-2 p-1 rounded-full hover:bg-accent transition-colors">
              <Avatar fallback={initials} size="sm" />
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
