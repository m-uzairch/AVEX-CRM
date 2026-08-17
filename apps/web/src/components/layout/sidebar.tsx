'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { canAccessRoute } from '@/features/rbac/config/rbac-matrix';
import { UserRole } from '@/features/rbac/types/rbac-types';
import { APP_NAME, APP_VERSION } from '@avex/constants';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UserCheck,
  Clock,
  FileText,
  FileCheck,
  DollarSign,
  Receipt,
  LineChart,
  Package,
  BarChart3,
  Calendar,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Percent,
  Repeat,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: 'CRM', href: '/crm', icon: <Users className="h-4 w-4" /> },
  { title: 'Projects', href: '/projects', icon: <FolderKanban className="h-4 w-4" /> },
  { title: 'Employees', href: '/employees', icon: <UserCheck className="h-4 w-4 text-xs" /> },
  { title: 'Attendance', href: '/attendance', icon: <Clock className="h-4 w-4" /> },
  { title: 'Quotations', href: '/quotations', icon: <FileCheck className="h-4 w-4" /> },
  { title: 'Invoices', href: '/invoices', icon: <FileText className="h-4 w-4" /> },
  { title: 'Recurring Invoices', href: '/invoices/recurring', icon: <Repeat className="h-4 w-4" /> },
  { title: 'Payments', href: '/payments', icon: <DollarSign className="h-4 w-4" /> },
  { title: 'Expenses', href: '/expenses', icon: <Receipt className="h-4 w-4" /> },
  { title: 'Taxes & Discounts', href: '/taxes', icon: <Percent className="h-4 w-4" /> },
  { title: 'Financials', href: '/financial-dashboard', icon: <LineChart className="h-4 w-4" /> },
  { title: 'Inventory', href: '/inventory', icon: <Package className="h-4 w-4" /> },
  { title: 'Reports', href: '/reports', icon: <BarChart3 className="h-4 w-4" /> },
  { title: 'Calendar', href: '/calendar', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Notifications', href: '/notifications', icon: <Bell className="h-4 w-4" />, badge: '3' },
  { title: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
];

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const role = (user?.role as UserRole) || 'COMPANY_OWNER';

  // Filter navigation items based on current user role permissions
  const filteredNavItems = navItems.filter((item) => canAccessRoute(role, item.href));

  const roleLabelMap: Record<UserRole, string> = {
    COMPANY_OWNER: 'Company Owner',
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee',
    CLIENT: 'Client Portal',
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
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-border bg-card transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-16' : 'w-60',
          isMobileOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-foreground">{APP_NAME}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{APP_VERSION}</span>
              </div>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            type="button"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Role Filtered Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors relative group',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.title}</span>}
                {item.badge && (!isCollapsed || isMobileOpen) && (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      isActive ? 'bg-primary-foreground text-primary' : 'bg-primary/10 text-primary',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Profile Summary */}
        <div className="p-3 border-t border-border flex items-center space-x-3 overflow-hidden">
          <div className="h-8 w-8 shrink-0 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground">
            {initials}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium truncate text-foreground">
                {user?.fullName || 'Alex Carter'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {roleLabelMap[role] || 'Company Owner'}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
