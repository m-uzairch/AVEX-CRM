import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Project } from '../types/project-types';
import { ProjectStatusBadge, ProjectPriorityBadge } from './project-badges';
import {
  MoreVertical,
  Calendar,
  Building,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ProjectTableProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onSort?: (field: 'name' | 'createdAt' | 'expectedCompletionDate' | 'priority' | 'status') => void;
}

export function ProjectTable({ projects, onEdit, onArchive, onDelete, onSort }: ProjectTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead className="cursor-pointer font-semibold" onClick={() => onSort?.('name')}>
              Project Name
            </TableHead>
            <TableHead className="hidden md:table-cell">Customer</TableHead>
            <TableHead className="hidden lg:table-cell">Category</TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort?.('status')}>
              Status
            </TableHead>
            <TableHead className="cursor-pointer hidden sm:table-cell" onClick={() => onSort?.('priority')}>
              Priority
            </TableHead>
            <TableHead className="hidden lg:table-cell">Team</TableHead>
            <TableHead className="hidden xl:table-cell cursor-pointer" onClick={() => onSort?.('expectedCompletionDate')}>
              Due Date
            </TableHead>
            <TableHead className="text-right w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const formattedDate = project.expectedCompletionDate
              ? new Date(project.expectedCompletionDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—';

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
              <TableRow key={project.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                  {project.projectCode}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors truncate max-w-[200px] lg:max-w-[300px]"
                    >
                      {project.name}
                    </Link>
                    {project.projectManager && (
                      <span className="text-[11px] text-muted-foreground truncate">
                        PM: {project.projectManager.fullName}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {project.customer ? (
                    <div className="flex items-center space-x-1.5 text-xs">
                      <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{project.customer.companyName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {project.category ? (
                    <span
                      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: project.category.color || '#3B82F6' }}
                    >
                      {project.category.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <ProjectPriorityBadge priority={project.priority} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {project.members && project.members.length > 0 ? (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {project.members.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold"
                          title={m.user?.fullName}
                        >
                          {m.user?.fullName
                            ? m.user.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .substring(0, 2)
                            : 'U'}
                        </div>
                      ))}
                      {project.members.length > 3 && (
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-bold">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                    items={menuItems}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
