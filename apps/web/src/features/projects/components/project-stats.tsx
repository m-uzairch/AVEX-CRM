import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectStats } from '../types/project-types';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  CheckSquare,
} from 'lucide-react';

interface ProjectStatsCardsProps {
  stats: ProjectStats;
  loading?: boolean;
}

export function ProjectStatsCards({ stats, loading }: ProjectStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-5 w-10 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Clock,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Completed',
      value: stats.completedProjects,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Overdue',
      value: stats.overdueProjects,
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Team Members',
      value: stats.totalTeamMembers,
      icon: Users,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="group shadow-subtle hover:shadow-subtle-hover hover:border-border/80 transition-all duration-200 ease-out">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className={`p-2.5 rounded-lg border shrink-0 card-hover-icon ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="truncate">
                <p className="text-xs text-muted-foreground font-medium truncate">{item.title}</p>
                <p className="text-xl font-bold tracking-tight text-foreground">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
