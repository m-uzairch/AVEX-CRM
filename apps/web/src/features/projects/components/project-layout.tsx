'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { cn } from '@/lib/utils';
import {
  FolderKanban,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Archive,
} from 'lucide-react';

interface ProjectLayoutProps {
  children: React.ReactNode;
  activeTab?: 'dashboard' | 'all' | 'active' | 'completed' | 'archived';
  title?: string;
  description?: string;
}

export function ProjectLayout({
  children,
  activeTab = 'dashboard',
  title = 'Project Management',
  description = 'Track project progress, task boards, milestones, team assignments, and deliverables.',
}: ProjectLayoutProps) {

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/projects',
      icon: LayoutDashboard,
    },
    {
      id: 'all',
      label: 'All Projects',
      href: '/projects?tab=all',
      icon: FolderKanban,
    },
    {
      id: 'active',
      label: 'Active Projects',
      href: '/projects?tab=active',
      icon: Clock,
    },
    {
      id: 'completed',
      label: 'Completed Projects',
      href: '/projects?tab=completed',
      icon: CheckCircle2,
    },
    {
      id: 'archived',
      label: 'Archived Projects',
      href: '/projects?tab=archived',
      icon: Archive,
    },
  ];

  return (
    <ContentContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: 'Projects', href: '/projects' }]}
      />

      {/* Module Navigation Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-1 sm:space-x-6 overflow-x-auto pb-px scrollbar-none" aria-label="Projects sub-navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex items-center space-x-2 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors',
                  isTabActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">{children}</div>
    </ContentContainer>
  );
}
