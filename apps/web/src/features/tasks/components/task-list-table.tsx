import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Task } from '../types/task-types';
import { TaskStatusBadge, TaskPriorityBadge } from './task-badges';
import {
  MoreVertical,
  Calendar,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface TaskListTableProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onSort?: (field: 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt') => void;
}

export function TaskListTable({
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onSort,
}: TaskListTableProps) {
  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return '—';
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs}h`;
  };

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="cursor-pointer font-semibold" onClick={() => onSort?.('title')}>
              Task Title
            </TableHead>
            <TableHead className="hidden md:table-cell">Project</TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort?.('status')}>
              Status
            </TableHead>
            <TableHead className="cursor-pointer hidden sm:table-cell" onClick={() => onSort?.('priority')}>
              Priority
            </TableHead>
            <TableHead className="hidden lg:table-cell">Assignees</TableHead>
            <TableHead className="hidden xl:table-cell cursor-pointer" onClick={() => onSort?.('dueDate')}>
              Due Date
            </TableHead>
            <TableHead className="hidden xl:table-cell text-right">Time Spent</TableHead>
            <TableHead className="text-right w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const formattedDueDate = task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—';

            const menuItems: DropdownMenuItem[] = [
              {
                label: 'View Task Details',
                icon: <ExternalLink className="h-3.5 w-3.5" />,
                onClick: () => onSelectTask(task),
              },
              ...(onEditTask
                ? [
                    {
                      label: 'Edit Task',
                      icon: <Edit className="h-3.5 w-3.5" />,
                      onClick: () => onEditTask(task),
                    },
                  ]
                : []),
              ...(onDeleteTask
                ? [
                    {
                      label: 'Delete Task',
                      icon: <Trash2 className="h-3.5 w-3.5" />,
                      onClick: () => onDeleteTask(task),
                      destructive: true,
                    },
                  ]
                : []),
            ];

            return (
              <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="text-left font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[250px] lg:max-w-[350px] cursor-pointer"
                    >
                      {task.title}
                    </button>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length} subtasks done
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {task.project ? (
                    <span className="text-xs font-mono font-medium text-foreground">
                      {task.project.projectCode}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <TaskPriorityBadge priority={task.priority} />
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  {task.assignees && task.assignees.length > 0 ? (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {task.assignees.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold"
                          title={a.user?.fullName}
                        >
                          {a.user?.fullName
                            ? a.user.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .substring(0, 2)
                            : 'U'}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Unassigned</span>
                  )}
                </TableCell>

                <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDueDate}</span>
                  </div>
                </TableCell>

                <TableCell className="hidden xl:table-cell text-right text-xs font-mono">
                  {formatTime(task.totalTimeSpent)}
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
