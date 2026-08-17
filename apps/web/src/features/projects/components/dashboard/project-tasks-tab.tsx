'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/features/tasks/components/kanban-board';
import { TaskListTable } from '@/features/tasks/components/task-list-table';
import { TaskDetailsDrawer } from '@/features/tasks/components/task-details-drawer';
import { TaskDialog } from '@/features/tasks/components/task-dialog';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/features/tasks/services/task-service';
import { Task, TaskStatus, TaskViewMode } from '@/features/tasks/types/task-types';
import { TaskFormValues } from '@/features/tasks/schemas/task-schemas';
import { LayoutGrid, List, Plus, Loader2, CheckSquare } from 'lucide-react';

interface ProjectTasksTabProps {
  projectId: string;
}

export function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<TaskViewMode>('kanban');
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const loadProjectTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchTasks({ projectId, pageSize: 100 });
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load project tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    loadProjectTasks();
  }, [loadProjectTasks]);

  const handleCreateTaskSubmit = async (values: TaskFormValues) => {
    await createTask({ ...values, projectId });
    setIsCreateModalOpen(false);
    loadProjectTasks();
  };

  const handleStatusMove = async (task: Task, newStatus: TaskStatus) => {
    await updateTask(task.id, { status: newStatus });
    loadProjectTasks();
  };

  const handleDeleteTask = async (task: Task) => {
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      await deleteTask(task.id);
      loadProjectTasks();
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl shadow-2xs">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-sm text-foreground">
            Project Tasks ({tasks.length})
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-card">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading project tasks...</span>
        </div>
      ) : (
        <>
          {viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              onStatusMove={handleStatusMove}
              onOpenCreateTask={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <TaskListTable
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </>
      )}

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadProjectTasks}
      />

      {/* Create Task Modal */}
      <TaskDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateTaskSubmit}
        defaultProjectId={projectId}
      />
    </div>
  );
}
