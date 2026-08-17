'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { milestoneFormSchema, MilestoneFormValues } from '../schemas/milestone-schemas';
import { ProjectMilestone } from '../types/milestone-types';
import { Loader2 } from 'lucide-react';

interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  milestone?: ProjectMilestone | null;
  onSave: (values: MilestoneFormValues) => Promise<void>;
}

export function MilestoneDialog({
  open,
  onOpenChange,
  projectId: _projectId,
  milestone,
  onSave,
}: MilestoneDialogProps) {
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      startDate: '',
      dueDate: '',
      progressPercentage: 0,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: milestone?.title || '',
        description: milestone?.description || '',
        status: milestone?.status || 'NOT_STARTED',
        priority: milestone?.priority || 'MEDIUM',
        startDate: milestone?.startDate ? milestone.startDate.substring(0, 10) : '',
        dueDate: milestone?.dueDate ? milestone.dueDate.substring(0, 10) : '',
        progressPercentage: milestone?.progressPercentage || 0,
        estimatedHours: milestone?.estimatedHours || undefined,
        budgetAllocation: milestone?.budgetAllocation || undefined,
      });
    }
  }, [open, milestone, reset]);

  const onSubmit = async (values: MilestoneFormValues) => {
    try {
      setSaving(true);
      await onSave(values);
      onOpenChange(false);
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={milestone ? 'Edit Milestone' : 'Create New Milestone'}
      description="Define milestone scope, deadline, priority, and progress tracking settings."
      className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs py-2">
        {/* Title */}
        <div className="space-y-1">
          <label className="font-semibold text-foreground">
            Milestone Title <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Design Phase Approval & Brand Sign-Off"
            {...register('title')}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-[11px] text-destructive">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="font-semibold text-foreground">Description</label>
          <Textarea
            placeholder="Describe the milestone scope and deliverables..."
            rows={3}
            {...register('description')}
          />
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Status</label>
            <select {...register('status')} className="w-full text-xs rounded-md border border-input bg-background p-2.5">
              <option value="NOT_STARTED">Not Started</option>
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="DELAYED">Delayed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Priority</label>
            <select {...register('priority')} className="w-full text-xs rounded-md border border-input bg-background p-2.5">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Start Date</label>
            <Input type="date" {...register('startDate')} />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Due Date</label>
            <Input type="date" {...register('dueDate')} />
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <label className="font-semibold text-foreground">Progress (%)</label>
          <Input
            type="number"
            min={0}
            max={100}
            {...register('progressPercentage', { valueAsNumber: true })}
          />
        </div>

        {/* Optional Estimates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Estimated Hours</label>
            <Input
              type="number"
              placeholder="e.g. 40"
              {...register('estimatedHours', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Budget Allocation ($)</label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              {...register('budgetAllocation', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2 font-bold">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {milestone ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
