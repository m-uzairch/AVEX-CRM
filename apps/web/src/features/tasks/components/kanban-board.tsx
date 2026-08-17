'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '../types/task-types';
import { TaskPriorityBadge } from './task-badges';
import {
  Clock,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Plus,
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onStatusMove: (task: Task, newStatus: TaskStatus) => void;
  onOpenCreateTask?: () => void;
}

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'Todo', color: 'border-t-slate-500 bg-slate-500/5' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-indigo-500 bg-indigo-500/5' },
  { id: 'REVIEW', title: 'Review', color: 'border-t-purple-500 bg-purple-500/5' },
  { id: 'BLOCKED', title: 'Blocked', color: 'border-t-rose-500 bg-rose-500/5' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-t-emerald-500 bg-emerald-500/5' },
];

export function KanbanBoard({
  tasks,
  onSelectTask,
  onStatusMove,
  onOpenCreateTask,
}: KanbanBoardProps) {
  const formatTimeSpent = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0h';
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs}h`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 scrollbar-none">
      {KANBAN_COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="flex flex-col min-w-[260px] bg-muted/40 rounded-xl border border-border p-3 space-y-3">
            {/* Column Header */}
            <div className={`p-2.5 rounded-lg border-t-4 border border-border bg-card flex items-center justify-between shadow-2xs ${col.color}`}>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-foreground">{col.title}</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>

              {onOpenCreateTask && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={onOpenCreateTask}
                  title="Add Task"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-muted-foreground/60 border border-dashed border-border rounded-lg bg-card/30">
                  No tasks in {col.title}
                </div>
              ) : (
                columnTasks.map((task) => {
                  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
                  const totalSubtasks = task.subtasks?.length || 0;

                  return (
                    <Card
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="cursor-pointer hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md bg-card group"
                    >
                      <CardContent className="p-3.5 space-y-2.5">
                        {/* Project Code & Priority */}
                        <div className="flex items-center justify-between gap-1">
                          {task.project && (
                            <span className="text-[10px] font-mono font-semibold text-muted-foreground truncate">
                              {task.project.projectCode}
                            </span>
                          )}
                          <TaskPriorityBadge priority={task.priority} />
                        </div>

                        {/* Task Title */}
                        <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {task.title}
                        </h4>

                        {/* Labels / Tags */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.map((lbl) => (
                              <span
                                key={lbl}
                                className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20"
                              >
                                {lbl}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Sub-stats & Footer */}
                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            {totalSubtasks > 0 && (
                              <span className="flex items-center gap-1 font-medium">
                                <CheckSquare className="h-3 w-3 text-emerald-500" />
                                {completedSubtasks}/{totalSubtasks}
                              </span>
                            )}

                            {task.comments && task.comments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments.length}
                              </span>
                            )}

                            {task.attachments && task.attachments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {task.attachments.length}
                              </span>
                            )}
                          </div>

                          {/* Time Spent */}
                          {task.totalTimeSpent > 0 && (
                            <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                              <Clock className="h-3 w-3 text-indigo-500" />
                              {formatTimeSpent(task.totalTimeSpent)}
                            </span>
                          )}
                        </div>

                        {/* Assignee Avatars & Quick Move */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {task.assignees && task.assignees.length > 0 ? (
                              task.assignees.slice(0, 3).map((a) => (
                                <div
                                  key={a.id}
                                  className="h-5 w-5 rounded-full bg-primary/10 text-primary border border-background flex items-center justify-center text-[8px] font-bold"
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
                              ))
                            ) : (
                              <span className="text-[9px] text-muted-foreground italic">Unassigned</span>
                            )}
                          </div>

                          {/* Quick Column Status Selector */}
                          <select
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              onStatusMove(task, e.target.value as TaskStatus);
                            }}
                            className="text-[9px] bg-muted/60 border border-border rounded px-1 py-0.5 text-muted-foreground hover:text-foreground focus:outline-none"
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="BLOCKED">Blocked</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
