import { create } from 'zustand';
import { TaskViewMode, TaskStatus, TaskPriority, Task } from '../types/task-types';

interface ActiveTimerState {
  taskId: string;
  taskTitle: string;
  startTime: number;
  timeEntryId?: string;
}

interface TaskStoreState {
  viewMode: TaskViewMode;
  searchQuery: string;
  statusFilter: TaskStatus | 'ALL';
  priorityFilter: TaskPriority | 'ALL';
  projectFilter: string | 'ALL';
  assigneeFilter: string | 'ALL';
  sortField: 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;

  isCreateModalOpen: boolean;
  selectedTaskId: string | null;
  activeTimer: ActiveTimerState | null;

  // Actions
  setViewMode: (mode: TaskViewMode) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: TaskStatus | 'ALL') => void;
  setPriorityFilter: (priority: TaskPriority | 'ALL') => void;
  setProjectFilter: (project: string | 'ALL') => void;
  setAssigneeFilter: (assignee: string | 'ALL') => void;
  setSort: (field: 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt', order?: 'asc' | 'desc') => void;
  setPage: (page: number) => void;

  setIsCreateModalOpen: (open: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;

  startTimer: (task: Task, timeEntryId?: string) => void;
  stopTimer: () => void;
  resetFilters: () => void;
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  viewMode: 'kanban',
  searchQuery: '',
  statusFilter: 'ALL',
  priorityFilter: 'ALL',
  projectFilter: 'ALL',
  assigneeFilter: 'ALL',
  sortField: 'dueDate',
  sortOrder: 'asc',
  page: 1,
  pageSize: 12,

  isCreateModalOpen: false,
  selectedTaskId: null,
  activeTimer: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, page: 1 }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority, page: 1 }),
  setProjectFilter: (project) => set({ projectFilter: project, page: 1 }),
  setAssigneeFilter: (assignee) => set({ assigneeFilter: assignee, page: 1 }),
  setSort: (field, order) =>
    set((state) => ({
      sortField: field,
      sortOrder: order || (state.sortField === field && state.sortOrder === 'asc' ? 'desc' : 'asc'),
    })),
  setPage: (page) => set({ page }),

  setIsCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  startTimer: (task, timeEntryId) =>
    set({
      activeTimer: {
        taskId: task.id,
        taskTitle: task.title,
        startTime: Date.now(),
        timeEntryId,
      },
    }),
  stopTimer: () => set({ activeTimer: null }),

  resetFilters: () =>
    set({
      searchQuery: '',
      statusFilter: 'ALL',
      priorityFilter: 'ALL',
      projectFilter: 'ALL',
      assigneeFilter: 'ALL',
      sortField: 'dueDate',
      sortOrder: 'asc',
      page: 1,
    }),
}));
