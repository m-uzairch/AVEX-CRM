'use client';

import * as React from 'react';
import { ContentContainer } from '@/components/layout/content-container';
import { useTaskStore } from '@/features/tasks/stores/task-store';
import { TaskFilters } from '@/features/tasks/components/task-filters';
import { KanbanBoard } from '@/features/tasks/components/kanban-board';
import { TaskListTable } from '@/features/tasks/components/task-list-table';
import { TaskCalendarView } from '@/features/tasks/components/task-calendar-view';
import { TaskDetailsDrawer } from '@/features/tasks/components/task-details-drawer';
import { TaskDialog } from '@/features/tasks/components/task-dialog';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/features/tasks/services/task-service';
import { Task, TaskStatus } from '@/features/tasks/types/task-types';
import { TaskFormValues } from '@/features/tasks/schemas/task-schemas';
import { AlertCircle, CheckSquare, Loader2 } from 'lucide-react';

export default function TasksPage() {
  const {
    viewMode,
    searchQuery,
    statusFilter,
    priorityFilter,
    sortField,
    sortOrder,
    page,
    isCreateModalOpen,
    selectedTaskId,
    setIsCreateModalOpen,
    setSelectedTaskId,
    setSort,
  } = useTaskStore();

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTasks({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        sortField,
        sortOrder,
        page,
        pageSize: 50,
      });
      setTasks(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, sortField, sortOrder, page]);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTaskSubmit = async (values: TaskFormValues) => {
    await createTask(values);
    setIsCreateModalOpen(false);
    loadTasks();
  };

  const handleStatusMove = async (task: Task, newStatus: TaskStatus) => {
    await updateTask(task.id, { status: newStatus });
    loadTasks();
  };

  const handleDeleteTask = async (task: Task) => {
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      await deleteTask(task.id);
      loadTasks();
    }
  };

  return (
    <ContentContainer>
      <div className="space-y-6">
        {/* Page Title & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks Workspace</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Manage, assign, and track task deliverables across all company projects.
            </p>
          </div>
        </div>

        {/* Filters & View Controls */}
        <TaskFilters />

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading task board...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-destructive/20 rounded-xl bg-destructive/5 space-y-2">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto" />
            <p className="text-xs font-semibold text-destructive">{error}</p>
          </div>
        ) : (
          <>
            {viewMode === 'kanban' && (
              <KanbanBoard
                tasks={tasks}
                onSelectTask={(task) => setSelectedTaskId(task.id)}
                onStatusMove={handleStatusMove}
                onOpenCreateTask={() => setIsCreateModalOpen(true)}
              />
            )}

            {viewMode === 'list' && (
              <TaskListTable
                tasks={tasks}
                onSelectTask={(task) => setSelectedTaskId(task.id)}
                onDeleteTask={handleDeleteTask}
                onSort={setSort}
              />
            )}

            {viewMode === 'calendar' && (
              <TaskCalendarView
                tasks={tasks}
                onSelectTask={(task) => setSelectedTaskId(task.id)}
              />
            )}
          </>
        )}
      </div>

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={loadTasks}
      />

      {/* Create Task Modal */}
      <TaskDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateTaskSubmit}
      />
    </ContentContainer>
  );
}
