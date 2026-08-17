import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '../types/project-types';
import { ProjectStatusBadge, ProjectPriorityBadge } from './project-badges';
import {
  MoreVertical,
  Calendar,
  Building,
  Users,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onArchive, onDelete }: ProjectCardProps) {
  const router = useRouter();

  const formattedDate = project.expectedCompletionDate
    ? new Date(project.expectedCompletionDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No due date';

  const menuItems: DropdownMenuItem[] = [
    {
      label: 'View Details',
      icon: <ExternalLink className="h-3.5 w-3.5" />,
      onClick: () => router.push(`/projects/${project.id}`),
    },
    ...(onEdit
      ? [
          {
            label: 'Edit Project',
            icon: <Edit className="h-3.5 w-3.5" />,
            onClick: () => onEdit(project),
          },
        ]
      : []),
    ...(onArchive
      ? [
          {
            label: project.isArchived ? 'Unarchive' : 'Archive',
            icon: <Archive className="h-3.5 w-3.5" />,
            onClick: () => onArchive(project),
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: 'Delete',
            icon: <Trash2 className="h-3.5 w-3.5" />,
            onClick: () => onDelete(project),
            destructive: true,
          },
        ]
      : []),
  ];

  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md group">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col space-y-1 truncate">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {project.projectCode}
              </span>
              {project.category && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: project.category.color || '#3B82F6' }}
                >
                  {project.category.name}
                </span>
              )}
            </div>
            <Link
              href={`/projects/${project.id}`}
              className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate pt-1"
            >
              {project.name}
            </Link>
          </div>

          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
            items={menuItems}
          />
        </div>

        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 space-y-4">
        {/* Customer & Manager info */}
        <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
          {project.customer && (
            <div className="flex items-center text-muted-foreground">
              <Building className="h-3.5 w-3.5 mr-2 shrink-0 text-primary/70" />
              <span className="truncate font-medium text-foreground">{project.customer.companyName}</span>
            </div>
          )}
          {project.projectManager && (
            <div className="flex items-center text-muted-foreground">
              <Users className="h-3.5 w-3.5 mr-2 shrink-0 text-primary/70" />
              <span className="truncate">
                PM: <span className="font-medium text-foreground">{project.projectManager.fullName}</span>
              </span>
            </div>
          )}
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-2 shrink-0 text-primary/70" />
            <span>Due: {formattedDate}</span>
          </div>
        </div>

        {/* Assigned Team Avatars */}
        {project.members && project.members.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-medium text-muted-foreground">Team</span>
            <div className="flex -space-x-2 overflow-hidden">
              {project.members.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold"
                  title={member.user?.fullName || 'Team Member'}
                >
                  {member.user?.fullName
                    ? member.user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)
                    : 'U'}
                </div>
              ))}
              {project.members.length > 4 && (
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-bold">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <ProjectStatusBadge status={project.status} />
        <ProjectPriorityBadge priority={project.priority} />
      </CardFooter>
    </Card>
  );
}
