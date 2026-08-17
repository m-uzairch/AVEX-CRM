'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ProjectTabId } from '../../types/project-types';
import {
  LayoutDashboard,
  CheckSquare,
  ListOrdered,
  Users,
  FileText,
  Calendar,
  StickyNote,
  Activity,
  BarChart3,
  History,
} from 'lucide-react';

interface ProjectTabsNavProps {
  activeTab: ProjectTabId;
  onTabChange: (tab: ProjectTabId) => void;
  counts?: {
    milestonesCount?: number;
    notesCount?: number;
    membersCount?: number;
  };
}

export function ProjectTabsNav({ activeTab, onTabChange, counts }: ProjectTabsNavProps) {
  const tabs: { id: ProjectTabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'milestones', label: 'Milestones', icon: <ListOrdered className="h-4 w-4" />, badge: counts?.milestonesCount },
    { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" />, badge: counts?.membersCount },
    { id: 'files', label: 'Files', icon: <FileText className="h-4 w-4" /> },
    { id: 'meetings', label: 'Meetings', icon: <Calendar className="h-4 w-4" /> },
    { id: 'notes', label: 'Notes', icon: <StickyNote className="h-4 w-4" />, badge: counts?.notesCount },
    { id: 'activity', label: 'Activity Feed', icon: <Activity className="h-4 w-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'history', label: 'Audit Timeline', icon: <History className="h-4 w-4" /> },
  ];

  return (
    <div className="border-b border-border mb-6">
      <nav className="flex space-x-1 sm:space-x-6 overflow-x-auto pb-px scrollbar-none" aria-label="Project Dashboard Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center space-x-2 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
