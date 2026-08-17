'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { taskFormSchema, TaskFormValues } from '../schemas/task-schemas';
import { Task } from '../types/task-types';
import { Loader2 } from 'lucide-react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  task?: Task | null;
  defaultProjectId?: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  defaultProjectId,
}: TaskDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [projects, setProjects] = React.useState<{ id: string; name: string; projectCode: string }[]>([]);

  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: defaultProjectId || '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      estimatedHours: undefined,
      assigneeIds: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || '',
          projectId: task.projectId,
          customerId: task.customerId || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          estimatedHours: task.estimatedHours || undefined,
          assigneeIds: task.assignees ? task.assignees.map((a) => a.userId) : [],
        });
      } else {
        reset({
          title: '',
          description: '',
          projectId: defaultProjectId || '',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '',
          estimatedHours: undefined,
          assigneeIds: [],
        });
      }

      // Fetch projects & users for options
      fetch('/api/projects?pageSize=100')
        .then((res) => res.json())
        .then((data) => {
          if (data.data) setProjects(data.data);
        })
        .catch(() => {});
    }
  }, [open, task, defaultProjectId, reset]);

  const handleFormSubmit = async (values: TaskFormValues) => {
    try {
      setLoading(true);
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      console.error('Task submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={isEditing ? 'Update task parameters, status, or assignees.' : 'Enter task title, project, due date, and assign employees.'}
      className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2 text-xs">
        {/* Title */}
        <div className="space-y-1">
          <label className="font-semibold text-foreground">
            Task Title <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Implement Supabase OAuth Authentication Flow"
            {...register('title')}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-[11px] text-destructive">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="font-semibold text-foreground">Description</label>
          <Textarea
            placeholder="Detailed instructions, requirements, or technical specs..."
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Project Selection */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Project <span className="text-destructive">*</span>
            </label>
            <select
              {...register('projectId')}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name}
                </option>
              ))}
            </select>
            {errors.projectId && <p className="text-[11px] text-destructive">{errors.projectId.message}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Priority</label>
            <select
              {...register('priority')}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Status</label>
            <select
              {...register('status')}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Estimated Hours */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Estimated Hours</label>
            <Input
              type="number"
              step="0.5"
              placeholder="e.g. 4.5"
              {...register('estimatedHours', { valueAsNumber: true })}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-foreground">Due Date</label>
            <Input type="date" {...register('dueDate')} />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
