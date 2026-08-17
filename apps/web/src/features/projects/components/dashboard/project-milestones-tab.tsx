'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectMilestone, GanttBar, TimelineZoom, UpcomingDeadline } from '@/features/milestones/types/milestone-types';
import { MilestoneFormValues } from '@/features/milestones/schemas/milestone-schemas';
import {
  fetchMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  archiveMilestone,
  fetchGanttData,
} from '@/features/milestones/services/milestone-service';
import { GanttTimelineView } from '@/features/milestones/components/gantt-timeline-view';
import { MilestoneDialog } from '@/features/milestones/components/milestone-dialog';
import { UpcomingDeadlinesWidget } from '@/features/milestones/components/upcoming-deadlines-widget';
import {
  Plus,
  List,
  GanttChartSquare,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  Edit,
  RotateCcw,
} from 'lucide-react';

interface ProjectMilestonesTabProps {
  projectId: string;
}

const STATUS_STYLES: Record<string, string> = {
  NOT_STARTED: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  PLANNING: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  IN_PROGRESS: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  UNDER_REVIEW: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  DELAYED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  CANCELLED: 'bg-gray-400/10 text-gray-500 border-gray-400/20',
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
  MEDIUM: 'bg-blue-400/10 text-blue-500 border-blue-400/20',
  HIGH: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  CRITICAL: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

type ViewMode = 'list' | 'gantt';

export function ProjectMilestonesTab({ projectId }: ProjectMilestonesTabProps) {
  const [milestones, setMilestones] = React.useState<ProjectMilestone[]>([]);
  const [ganttBars, setGanttBars] = React.useState<GanttBar[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [ganttZoom, setGanttZoom] = React.useState<TimelineZoom>('month');
  const [showArchived, setShowArchived] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingMilestone, setEditingMilestone] = React.useState<ProjectMilestone | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [ms, gb] = await Promise.all([
        fetchMilestones({ projectId, includeArchived: showArchived }),
        fetchGanttData(projectId),
      ]);
      setMilestones(ms);
      setGanttBars(gb);
    } catch (err) {
      console.error('Failed to load milestones:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, showArchived]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveMilestone = async (values: MilestoneFormValues) => {
    if (editingMilestone) {
      await updateMilestone(editingMilestone.id, {
        ...values,
        startDate: values.startDate || undefined,
        dueDate: values.dueDate || undefined,
      });
    } else {
      await createMilestone({
        projectId,
        ...values,
        startDate: values.startDate || undefined,
        dueDate: values.dueDate || undefined,
      });
    }
    setEditingMilestone(null);
    loadData();
  };

  const handleStatusChange = async (milestoneId: string, status: ProjectMilestone['status']) => {
    await updateMilestone(milestoneId, { status });
    loadData();
  };

  const handleDelete = async (milestone: ProjectMilestone) => {
    if (confirm(`Delete milestone "${milestone.title}"?`)) {
      await deleteMilestone(milestone.id);
      loadData();
    }
  };

  const handleArchive = async (milestone: ProjectMilestone) => {
    await archiveMilestone(milestone.id, milestone.isArchived);
    loadData();
  };

  // Compute upcoming deadlines for widget
  const upcomingDeadlines: UpcomingDeadline[] = milestones
    .filter((m) => m.dueDate && !m.isArchived)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 8)
    .map((m) => ({
      id: m.id,
      title: m.title,
      projectId: m.projectId,
      dueDate: m.dueDate!,
      priority: m.priority,
      status: m.status,
      daysRemaining: m.daysRemaining ?? 0,
      isOverdue: m.isOverdue ?? false,
    }));

  const overdueCount = milestones.filter((m) => m.isOverdue && !m.isArchived).length;
  const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: milestones.length, icon: List, color: 'text-foreground' },
          { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'In Progress', value: milestones.filter((m) => m.status === 'IN_PROGRESS').length, icon: Clock, color: 'text-indigo-500' },
          { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: 'text-rose-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <Icon className={`h-7 w-7 ${color} opacity-30`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overdue Alert Banner */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{overdueCount} milestone{overdueCount > 1 ? 's are' : ' is'} overdue. Review and update project status.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Milestones Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl shadow-2xs">
            <div className="flex items-center rounded-lg border border-border p-0.5 bg-card">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-3.5 w-3.5" /> List View
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'gantt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <GanttChartSquare className="h-3.5 w-3.5" /> Timeline
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="text-xs h-8 gap-1.5"
              >
                <Archive className="h-3.5 w-3.5" />
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>

              <Button
                size="sm"
                onClick={() => { setEditingMilestone(null); setIsDialogOpen(true); }}
                className="gap-1.5 text-xs h-8 font-bold"
              >
                <Plus className="h-4 w-4" /> New Milestone
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading milestones...</span>
            </div>
          ) : viewMode === 'gantt' ? (
            <GanttTimelineView
              bars={ganttBars}
              zoom={ganttZoom}
              onZoomChange={setGanttZoom}
            />
          ) : milestones.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No milestones yet. Click &quot;New Milestone&quot; to add the first milestone.
            </Card>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <Card
                  key={milestone.id}
                  className={`shadow-2xs transition-all duration-200 hover:border-primary/40 ${
                    milestone.isArchived ? 'opacity-60' : ''
                  } ${milestone.isOverdue ? 'border-rose-500/30' : ''}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${STATUS_STYLES[milestone.status]}`}
                          >
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${PRIORITY_STYLES[milestone.priority]}`}
                          >
                            {milestone.priority}
                          </Badge>
                          {milestone.isOverdue && (
                            <Badge variant="destructive" className="text-[10px] font-bold">
                              {milestone.daysOverdue}d Overdue
                            </Badge>
                          )}
                          {milestone.isArchived && (
                            <Badge variant="secondary" className="text-[10px] font-semibold">
                              Archived
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-foreground">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{milestone.description}</p>
                        )}
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => { setEditingMilestone(milestone); setIsDialogOpen(true); }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-amber-500"
                          onClick={() => handleArchive(milestone)}
                          title={milestone.isArchived ? 'Restore' : 'Archive'}
                        >
                          {milestone.isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(milestone)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-bold">{milestone.progressPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            milestone.status === 'COMPLETED' ? 'bg-emerald-500' :
                            milestone.isOverdue ? 'bg-rose-500' : 'bg-primary'
                          }`}
                          style={{ width: `${milestone.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground border-t border-border pt-2">
                      <div className="flex items-center gap-3">
                        {milestone.startDate && (
                          <span>Start: <span className="font-mono font-semibold text-foreground">{new Date(milestone.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></span>
                        )}
                        {milestone.dueDate && (
                          <span className={milestone.isOverdue ? 'text-rose-500 font-bold' : ''}>
                            Due: <span className="font-mono font-semibold">{new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>
                        )}
                        {milestone.daysRemaining !== null && milestone.daysRemaining !== undefined && !milestone.isOverdue && milestone.status !== 'COMPLETED' && (
                          <span className={milestone.daysRemaining <= 3 ? 'text-amber-500 font-bold' : ''}>
                            {milestone.daysRemaining}d remaining
                          </span>
                        )}
                      </div>

                      {/* Quick Status Changer */}
                      {!milestone.isArchived && milestone.status !== 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 px-2"
                          onClick={() => handleStatusChange(milestone.id, 'COMPLETED')}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Upcoming Deadlines */}
        <div>
          <UpcomingDeadlinesWidget
            milestones={upcomingDeadlines}
            projectId={projectId}
          />
        </div>
      </div>

      {/* Milestone Dialog */}
      <MilestoneDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingMilestone(null);
        }}
        projectId={projectId}
        milestone={editingMilestone}
        onSave={handleSaveMilestone}
      />
    </div>
  );
}
