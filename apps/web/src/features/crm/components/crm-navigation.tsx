'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GitPullRequest,
  Contact,
  Activity,
} from 'lucide-react';

export interface CRMNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  count?: number;
}

const crmNavItems: CRMNavItem[] = [
  {
    title: 'Overview',
    href: '/crm',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: 'Customers',
    href: '/crm/customers',
    icon: <Users className="h-4 w-4" />,
    count: 1248,
  },
  {
    title: 'Leads',
    href: '/crm/leads',
    icon: <UserPlus className="h-4 w-4" />,
    count: 86,
  },
  {
    title: 'Pipeline',
    href: '/crm/pipeline',
    icon: <GitPullRequest className="h-4 w-4" />,
    count: 34,
  },
  {
    title: 'Contacts',
    href: '/crm/contacts',
    icon: <Contact className="h-4 w-4" />,
  },
  {
    title: 'Activities',
    href: '/crm/activities',
    icon: <Activity className="h-4 w-4" />,
  },
];

export function CRMNavigation() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-card/40 backdrop-blur-xs px-4 sm:px-6">
      <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="CRM Navigation">
        {crmNavItems.map((item) => {
          const isExact = pathname === item.href;
          const isSubRoute = item.href !== '/crm' && pathname?.startsWith(item.href);
          const isActive = isExact || isSubRoute;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 select-none',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
              {typeof item.count === 'number' && (
                <span
                  className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
