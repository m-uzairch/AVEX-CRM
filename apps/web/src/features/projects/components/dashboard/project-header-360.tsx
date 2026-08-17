'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectStatusBadge, ProjectPriorityBadge } from '../project-badges';
import {
  Project,
  ProjectHealthStatus,
  ProjectProgressMetrics,
} from '../../types/project-types';
import {
  ArrowLeft,
  Edit,
  Copy,
  Archive,
  MoreVertical,
  HeartPulse,
  Building,
  User,
  Share2,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ProjectHeader360Props {
  project: Project;
  health: ProjectHealthStatus;
  progress: ProjectProgressMetrics;
  onEdit: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onDeliver?: () => void;
  onReport?: () => void;
}

export function ProjectHeader360({
  project,
  health,
  progress,
  onEdit,
  onArchive,
  onDuplicate,
  onDeliver,
  onReport,
}: ProjectHeader360Props) {
  const router = useRouter();

  const getHealthBadge = (healthStatus: ProjectHealthStatus) => {
    switch (healthStatus) {
      case 'HEALTHY':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 font-bold">
            <HeartPulse className="h-3.5 w-3.5" /> Healthy
          </Badge>
        );
      case 'AT_RISK':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 font-bold">
            <HeartPulse className="h-3.5 w-3.5" /> At Risk
          </Badge>
        );
      case 'DELAYED':
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1 font-bold">
            <HeartPulse className="h-3.5 w-3.5" /> Delayed
          </Badge>
        );
    }
  };

  const menuItems: DropdownMenuItem[] = [
    {
      label: 'Edit Project Details',
      icon: <Edit className="h-3.5 w-3.5" />,
      onClick: onEdit,
    },
    {
      label: 'Duplicate Project',
      icon: <Copy className="h-3.5 w-3.5" />,
      onClick: onDuplicate,
    },
    {
      label: project.isArchived ? 'Unarchive Project' : 'Archive Project',
      icon: <Archive className="h-3.5 w-3.5" />,
      onClick: onArchive,
    },
    {
      label: 'Copy Project Link',
      icon: <Share2 className="h-3.5 w-3.5" />,
      onClick: () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Project workspace link copied to clipboard!');
      },
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4 mb-6">
      {/* Top Bar Navigation & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/projects')}
            className="h-9 w-9 shrink-0 mt-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {project.projectCode}
              </span>
              {getHealthBadge(health)}
              <ProjectStatusBadge status={project.status} />
              <ProjectPriorityBadge priority={project.priority} />
              {project.category && (
                <span
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: project.category.color }}
                >
                  {project.category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>

            {project.customer && (
              <div className="flex items-center text-xs text-muted-foreground space-x-1.5">
                <Building className="h-3.5 w-3.5 text-primary/70" />
                <span>Customer:</span>
                <Link
                  href={`/crm/customers/${project.customer.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {project.customer.companyName} ({project.customer.name})
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {onDeliver && (
            <Button
              size="sm"
              onClick={onDeliver}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Deliver Project
            </Button>
          )}
          {onReport && (
            <Button variant="outline" size="sm" onClick={onReport} className="gap-1.5 text-xs font-semibold">
              Final Report
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 hidden sm:flex">
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDuplicate} className="gap-1.5 hidden md:flex">
            <Copy className="h-4 w-4" /> Duplicate
          </Button>
          <DropdownMenu
            trigger={
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            items={menuItems}
          />
        </div>
      </div>

      {/* Progress Bar & Sub Summary Bar */}
      <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-1.5 max-w-md">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Overall Completion</span>
            <span className="text-primary font-bold">{progress.completionPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* PM Profile */}
        {project.projectManager && (
          <div className="flex items-center space-x-2 text-xs shrink-0">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Project Lead:</span>
            <div className="flex items-center space-x-1.5 font-semibold text-foreground">
              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[9px]">
                {project.projectManager.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2)}
              </div>
              <span>{project.projectManager.fullName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
