'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SettingsTab } from '../types/settings-types';
import {
  User,
  Sliders,
  Building2,
  Users,
  Bell,
  Mail,
  Calendar,
  Shield,
  Layers,
} from 'lucide-react';

interface SettingsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  canManageCompany?: boolean;
}

interface NavItem {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
  adminOnly?: boolean;
}

export function SettingsNav({ activeTab, onTabChange, canManageCompany = true }: SettingsNavProps) {
  const items: NavItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      description: 'Personal details & public profile',
    },
    {
      id: 'account',
      label: 'Account',
      icon: <Sliders className="h-4 w-4" />,
      description: 'Language, timezone & formats',
    },
    {
      id: 'company',
      label: 'Company',
      icon: <Building2 className="h-4 w-4" />,
      description: 'Organization info & branding',
      adminOnly: true,
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: <Users className="h-4 w-4" />,
      description: 'Team permissions & credentials',
      adminOnly: true,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      description: 'In-app & email event alerts',
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="h-4 w-4" />,
      description: 'Provider & delivery status',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Working hours & reminders',
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="h-4 w-4" />,
      description: 'Password & active sessions',
    },
    {
      id: 'crm',
      label: 'CRM Preferences',
      icon: <Layers className="h-4 w-4" />,
      description: 'Default views & currencies',
    },
  ];

  const visibleItems = items.filter((item) => !item.adminOnly || canManageCompany);

  return (
    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
      {visibleItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <span className={cn('shrink-0', isActive ? 'text-primary-foreground' : 'text-primary')}>
              {item.icon}
            </span>
            <div className="flex flex-col">
              <span>{item.label}</span>
              <span
                className={cn(
                  'text-[10px] hidden lg:block font-normal truncate',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
