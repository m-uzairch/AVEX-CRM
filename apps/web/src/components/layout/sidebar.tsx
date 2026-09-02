'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useNotificationStore } from '@/features/notifications/stores/notification-store';
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
  LineChart,
  Package,
  BarChart3,
  Calendar,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  ExternalLink,
  Landmark,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

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

  const unreadCount = useNotificationStore((state) => state.kpis.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  React.useEffect(() => {
    fetchNotifications().catch(() => {});
  }, [fetchNotifications]);

  const navItems: NavItem[] = React.useMemo(
    () => [
      { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { title: 'CRM', href: '/crm', icon: <Users className="h-4 w-4" /> },
      { title: 'Projects', href: '/projects', icon: <FolderKanban className="h-4 w-4" /> },
      { title: 'Employees', href: '/employees', icon: <UserCheck className="h-4 w-4 text-xs" /> },
      { title: 'Attendance', href: '/attendance', icon: <Clock className="h-4 w-4" /> },
      { title: 'Quotations', href: '/quotations', icon: <FileCheck className="h-4 w-4" /> },
      { title: 'Invoices', href: '/invoices', icon: <FileText className="h-4 w-4" /> },
      { title: 'Finance', href: '/finance', icon: <Landmark className="h-4 w-4" /> },
      { title: 'Financials', href: '/financial-dashboard', icon: <LineChart className="h-4 w-4" /> },
      { title: 'Inventory', href: '/inventory', icon: <Package className="h-4 w-4" /> },
      { title: 'Reports', href: '/reports', icon: <BarChart3 className="h-4 w-4" /> },
      { title: 'Calendar', href: '/calendar', icon: <Calendar className="h-4 w-4" /> },
      {
        title: 'Notifications',
        href: '/notifications',
        icon: <Bell className="h-4 w-4" />,
        badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : undefined,
      },
      { title: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
    ],
    [unreadCount]
  );

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
          'fixed top-3 bottom-3 left-3 z-40 flex flex-col rounded-xl border border-border/80 bg-card/90 backdrop-blur-md dark:bg-card/85 shadow-subtle overflow-hidden transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-16' : 'w-60',
          isMobileOpen ? 'translate-x-0 w-60 z-50 shadow-lg' : '-translate-x-[calc(100%+1.5rem)] lg:translate-x-0',
        )}
      >
        {/* Sidebar Header with collision-free collapsed state */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-border transition-all duration-200',
            isCollapsed ? 'justify-center px-0' : 'justify-between px-4'
          )}
        >
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              className="group relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-200 shadow-2xs"
              type="button"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <Building2 className="h-5 w-5 block group-hover:hidden transition-transform" />
              <ChevronRight className="h-5 w-5 hidden group-hover:block transition-transform" />
            </button>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-sm tracking-tight text-foreground">{APP_NAME}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{APP_VERSION}</span>
                </div>
              </Link>
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                type="button"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          )}
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
                  isCollapsed && 'justify-center px-2',
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

          {/* Client Portal Quick Switch Notice if in Client Role */}
          {role === 'CLIENT' && (
            <div className={cn('py-4 space-y-2', isCollapsed ? 'px-1 text-center' : 'px-2')}>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-muted-foreground">
                {!isCollapsed && <p className="font-semibold text-foreground mb-1">Client Portal View</p>}
                {!isCollapsed && <p className="text-[11px] mb-2">You are in Client Mode.</p>}
                <Link
                  href="/portal"
                  className={cn(
                    'inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors',
                    isCollapsed ? 'h-8 w-8 p-0' : 'w-full px-3 py-1.5 space-x-1.5'
                  )}
                  title="Open Client Portal"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {!isCollapsed && <span>Open Portal</span>}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Profile Summary */}
        <div
          className={cn(
            'border-t border-border flex items-center overflow-hidden transition-all duration-200',
            isCollapsed ? 'p-2 justify-center' : 'p-3 space-x-3'
          )}
        >
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
