'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  projectFormSchema,
  ProjectFormValues,
} from '../schemas/project-schemas';
import { Project, ProjectCategory } from '../types/project-types';
import { Loader2 } from 'lucide-react';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  project?: Project | null;
  categories?: ProjectCategory[];
}

export function ProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  project,
  categories = [],
}: ProjectDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState<{ id: string; companyName: string }[]>([]);
  const [users, setUsers] = React.useState<{ id: string; fullName: string }[]>([]);

  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      customerId: '',
      projectManagerId: '',
      categoryId: '',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: '',
      expectedCompletionDate: '',
      budget: undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (project) {
        reset({
          name: project.name,
          description: project.description || '',
          customerId: project.customerId || '',
          projectManagerId: project.projectManagerId || '',
          categoryId: project.categoryId || '',
          status: project.status,
          priority: project.priority,
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          expectedCompletionDate: project.expectedCompletionDate ? new Date(project.expectedCompletionDate).toISOString().split('T')[0] : '',
          budget: project.budget || undefined,
        });
      } else {
        reset({
          name: '',
          description: '',
          customerId: '',
          projectManagerId: '',
          categoryId: '',
          status: 'PLANNING',
          priority: 'MEDIUM',
          startDate: '',
          expectedCompletionDate: '',
          budget: undefined,
        });
      }

      // Fetch customers & users for options dropdowns
      fetch('/api/crm/customers?pageSize=100')
        .then((res) => res.json())
        .then((data) => {
          if (data.data) setCustomers(data.data);
        })
        .catch(() => {});

      fetch('/api/crm/users?pageSize=100')
        .then((res) => res.json())
        .then((data) => {
          if (data.users) setUsers(data.users);
        })
        .catch(() => {});
    }
  }, [open, project, reset]);

  const handleFormSubmit = async (values: ProjectFormValues) => {
    try {
      setLoading(true);
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      console.error('Project form submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      description={
        isEditing
          ? 'Update project details, status, dates, or assignees.'
          : 'Enter details to establish a new project entity with an auto-generated project code.'
      }
      className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
        {/* Project Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            Project Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. E-Commerce Redesign 2026"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-[11px] text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Description</label>
          <Textarea
            placeholder="Outline project objectives, key scope, and deliverables..."
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Customer / Account</label>
            <select
              {...register('customerId')}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Customer (Optional)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Project Manager */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Project Manager</label>
            <select
              {...register('projectManagerId')}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Project Manager</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Category</label>
            <select
              {...register('categoryId')}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Status</label>
            <select
              {...register('status')}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="PLANNING">Planning</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Priority</label>
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

          {/* Budget */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Budget ($)</label>
            <Input
              type="number"
              placeholder="e.g. 15000"
              {...register('budget', { valueAsNumber: true })}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Start Date</label>
            <Input type="date" {...register('startDate')} />
          </div>

          {/* Expected Completion Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Target Due Date</label>
            <Input type="date" {...register('expectedCompletionDate')} />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
