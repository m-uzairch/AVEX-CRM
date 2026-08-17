'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProjectTabId } from '../../types/project-types';
import {
  CheckSquare,
  FileText,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react';

interface ProjectPlaceholderTabProps {
  tabId: ProjectTabId;
}

export function ProjectPlaceholderTab({ tabId }: ProjectPlaceholderTabProps) {
  const getTabConfig = () => {
    switch (tabId) {
      case 'tasks':
        return {
          icon: <CheckSquare className="h-8 w-8 text-primary" />,
          title: 'Project Tasks & Board View',
          description: 'Task board, Kanban pipeline, assignment tracking, and task priorities will be enabled in Task 004.',
        };
      case 'files':
        return {
          icon: <FileText className="h-8 w-8 text-indigo-500" />,
          title: 'Project File Manager',
          description: 'Document uploads, file versioning, attachments, and cloud storage integration.',
        };
      case 'meetings':
        return {
          icon: <Calendar className="h-8 w-8 text-emerald-500" />,
          title: 'Project Meetings & Calendar Schedule',
          description: 'Schedule team standups, milestone reviews, and client calls directly inside the project workspace.',
        };
      case 'reports':
        return {
          icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
          title: 'Project Performance & Financial Analytics',
          description: 'Budget vs actual spending, velocity charts, milestone burndown reports, and profitability tracking.',
        };
      default:
        return {
          icon: <Sparkles className="h-8 w-8 text-amber-500" />,
          title: 'Module Workspace',
          description: 'This module is scheduled for full implementation during Sprint 03.',
        };
    }
  };

  const config = getTabConfig();

  return (
    <Card>
      <CardContent className="p-8">
        <EmptyState
          icon={config.icon}
          title={config.title}
          description={config.description}
        />
      </CardContent>
    </Card>
  );
}
