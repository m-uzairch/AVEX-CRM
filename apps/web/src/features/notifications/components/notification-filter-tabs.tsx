'use client';

import * as React from 'react';
import { NotificationCategory } from '../types/notification-types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Bell,
  CheckCircle2,
  DollarSign,
  UserCheck,
  FolderKanban,
  Video,
  Globe,
} from 'lucide-react';

interface NotificationFilterTabsProps {
  selectedCategory: 'ALL' | NotificationCategory;
  unreadOnly: boolean;
  onSelectCategory: (cat: 'ALL' | NotificationCategory) => void;
  onToggleUnreadOnly: (unread: boolean) => void;
  counts?: {
    all: number;
    unread: number;
    finance: number;
    crm: number;
    projects: number;
    meetings: number;
    portal: number;
  };
}

export function NotificationFilterTabs({
  selectedCategory,
  unreadOnly,
  onSelectCategory,
  onToggleUnreadOnly,
  counts,
}: NotificationFilterTabsProps) {
  const tabs: {
    key: 'ALL' | NotificationCategory;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      key: 'ALL',
      label: 'All Activity',
      icon: <Bell className="h-3.5 w-3.5" />,
      count: counts?.all,
    },
    {
      key: 'FINANCE',
      label: 'Finance & Invoices',
      icon: <DollarSign className="h-3.5 w-3.5 text-emerald-500" />,
      count: counts?.finance,
    },
    {
      key: 'CRM',
      label: 'Leads & Customers',
      icon: <UserCheck className="h-3.5 w-3.5 text-blue-500" />,
      count: counts?.crm,
    },
    {
      key: 'PROJECTS',
      label: 'Projects & Tasks',
      icon: <FolderKanban className="h-3.5 w-3.5 text-purple-500" />,
      count: counts?.projects,
    },
    {
      key: 'COMMUNICATION',
      label: 'Meetings & Schedule',
      icon: <Video className="h-3.5 w-3.5 text-rose-500" />,
      count: counts?.meetings,
    },
    {
      key: 'PORTAL',
      label: 'Client Portal',
      icon: <Globe className="h-3.5 w-3.5 text-cyan-500" />,
      count: counts?.portal,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-border">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isSelected = !unreadOnly && selectedCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                onToggleUnreadOnly(false);
                onSelectCategory(tab.key);
              }}
              className={cn(
                'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] px-1 py-0 h-4 ml-1',
                    isSelected
                      ? 'border-primary-foreground/40 bg-primary-foreground/20 text-primary-foreground'
                      : 'border-border bg-muted/60 text-muted-foreground'
                  )}
                >
                  {tab.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Unread Only Quick Filter */}
      <button
        type="button"
        onClick={() => onToggleUnreadOnly(!unreadOnly)}
        className={cn(
          'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0',
          unreadOnly
            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
            : 'bg-card text-foreground border-border hover:bg-accent'
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        <span>Unread Only</span>
        {counts?.unread !== undefined && counts.unread > 0 && (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0 h-4 ml-1 font-bold',
              unreadOnly
                ? 'border-primary-foreground bg-primary-foreground text-primary'
                : 'border-primary/40 bg-primary/10 text-primary'
            )}
          >
            {counts.unread}
          </Badge>
        )}
      </button>
    </div>
  );
}
