'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TaskStatusBadge, TaskPriorityBadge } from './task-badges';
import { Task, TaskStatus } from '../types/task-types';
import {
  fetchTaskById,
  updateTask,
  deleteTask,
  addSubtask,
  toggleSubtask,
  addTaskComment,
  startTaskTimer,
  stopTaskTimer,
} from '../services/task-service';
import {
  Play,
  Square,
  Clock,
  CheckSquare,
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Loader2,
} from 'lucide-react';

interface TaskDetailsDrawerProps {
  taskId: string | null;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export function TaskDetailsDrawer({
  taskId,
  onClose,
  onTaskUpdated,
}: TaskDetailsDrawerProps) {
  const [task, setTask] = React.useState<Task | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState(0);
  const [activeTimeEntryId, setActiveTimeEntryId] = React.useState<string | undefined>(undefined);

  // Subtask Form
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');

  // Comment Form
  const [newCommentContent, setNewCommentContent] = React.useState('');
  const [submittingComment, setSubmittingComment] = React.useState(false);

  const loadTask = React.useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const data = await fetchTaskById(taskId);
      setTask(data);
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  React.useEffect(() => {
    if (taskId) {
      loadTask();
    } else {
      setTask(null);
    }
  }, [taskId, loadTask]);

  // Live timer interval calculation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleStartTimer = async () => {
    if (!task) return;
    try {
      const entry = await startTaskTimer(task.id);
      setActiveTimeEntryId(entry.id);
      setTimerRunning(true);
      setTimerSeconds(0);
    } catch (err) {
      console.error('Failed to start timer:', err);
    }
  };

  const handleStopTimer = async () => {
    if (!task) return;
    try {
      await stopTaskTimer(task.id, activeTimeEntryId);
      setTimerRunning(false);
      setTimerSeconds(0);
      setActiveTimeEntryId(undefined);
      loadTask();
      onTaskUpdated();
    } catch (err) {
      console.error('Failed to stop timer:', err);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    // Check dependency warning
    if (newStatus === 'COMPLETED' && task.dependencies && task.dependencies.length > 0) {
      const unresolved = task.dependencies.filter((d) => d.dependsOn?.status !== 'COMPLETED');
      if (unresolved.length > 0) {
        if (!confirm(`Warning: This task depends on ${unresolved.length} unresolved parent task(s). Are you sure you want to mark it as Completed?`)) {
          return;
        }
      }
    }

    await updateTask(task.id, { status: newStatus });
    loadTask();
    onTaskUpdated();
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newSubtaskTitle.trim()) return;

    await addSubtask(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
    loadTask();
    onTaskUpdated();
  };

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    if (!task) return;
    await toggleSubtask(task.id, subtaskId, isCompleted);
    loadTask();
    onTaskUpdated();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newCommentContent.trim()) return;

    try {
      setSubmittingComment(true);
      await addTaskComment(task.id, newCommentContent);
      setNewCommentContent('');
      loadTask();
      onTaskUpdated();
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      await deleteTask(task.id);
      onClose();
      onTaskUpdated();
    }
  };

  const formatSeconds = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!taskId) return null;

  return (
    <Dialog
      isOpen={!!taskId}
      onClose={onClose}
      title={task ? task.title : 'Task Details'}
      description={task?.project ? `Project: ${task.project.projectCode} - ${task.project.name}` : ''}
      className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
    >
      {loading || !task ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading task workspace...</span>
        </div>
      ) : (
        <div className="space-y-6 text-xs">
          {/* Header Badges & Actions */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="text-xs p-1.5 rounded border border-input bg-background font-medium"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="BLOCKED">Blocked</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <Button variant="destructive" size="sm" onClick={handleDeleteTask} className="h-7 px-2">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Time Tracking Widget */}
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time Tracker</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-mono font-bold text-foreground">
                    {formatSeconds(task.totalTimeSpent + timerSeconds)}
                  </span>
                  {task.estimatedHours && (
                    <span className="text-xs text-muted-foreground font-mono">
                      / {task.estimatedHours}h est.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              {timerRunning ? (
                <Button size="sm" variant="destructive" onClick={handleStopTimer} className="gap-1.5 font-bold">
                  <Square className="h-3.5 w-3.5 fill-current" /> Stop Timer
                </Button>
              ) : (
                <Button size="sm" onClick={handleStartTimer} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  <Play className="h-3.5 w-3.5 fill-current" /> Start Timer
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">Description</span>
              <p className="p-3 rounded-lg border border-border bg-muted/20 text-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Subtasks Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-muted-foreground uppercase text-[10px] flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-primary" /> Subtasks (
                {task.subtasks?.filter((s) => s.isCompleted).length || 0}/{task.subtasks?.length || 0})
              </span>
            </div>

            <form onSubmit={handleAddSubtask} className="flex space-x-2">
              <Input
                placeholder="Add subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button type="submit" size="sm" className="h-8 px-3">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </form>

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-1.5 divide-y divide-border">
                {task.subtasks.map((sub) => (
                  <div key={sub.id} className="pt-1.5 flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={(e) => handleToggleSubtask(sub.id, e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className={`text-xs ${sub.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments Feed */}
          <div className="space-y-3 pt-4 border-t border-border">
            <span className="font-bold text-muted-foreground uppercase text-[10px] flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" /> Comments ({task.comments?.length || 0})
            </span>

            <form onSubmit={handleAddComment} className="space-y-2">
              <Textarea
                placeholder="Write a comment..."
                rows={2}
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="text-xs"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingComment || !newCommentContent.trim()}
                  className="gap-1.5 h-7 text-xs"
                >
                  {submittingComment ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Post Comment
                </Button>
              </div>
            </form>

            {task.comments && task.comments.length > 0 && (
              <div className="space-y-3 pt-2">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg border border-border bg-card space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">{comment.user?.fullName || 'User'}</span>
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
