import { create } from 'zustand';
import { ProjectStatus, ProjectPriority, ViewMode } from '../types/project-types';

interface ProjectState {
  viewMode: ViewMode;
  searchQuery: string;
  statusFilter: ProjectStatus | 'ALL';
  priorityFilter: ProjectPriority | 'ALL';
  categoryFilter: string | 'ALL';
  managerFilter: string | 'ALL';
  sortField: 'name' | 'createdAt' | 'expectedCompletionDate' | 'priority' | 'status';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
  isCreateModalOpen: boolean;
  selectedProjectId: string | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ProjectStatus | 'ALL') => void;
  setPriorityFilter: (priority: ProjectPriority | 'ALL') => void;
  setCategoryFilter: (category: string | 'ALL') => void;
  setManagerFilter: (manager: string | 'ALL') => void;
  setSort: (field: 'name' | 'createdAt' | 'expectedCompletionDate' | 'priority' | 'status', order?: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setSelectedProjectId: (id: string | null) => void;
  resetFilters: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  viewMode: 'grid',
  searchQuery: '',
  statusFilter: 'ALL',
  priorityFilter: 'ALL',
  categoryFilter: 'ALL',
  managerFilter: 'ALL',
  sortField: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 9,
  isCreateModalOpen: false,
  selectedProjectId: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, page: 1 }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority, page: 1 }),
  setCategoryFilter: (category) => set({ categoryFilter: category, page: 1 }),
  setManagerFilter: (manager) => set({ managerFilter: manager, page: 1 }),
  setSort: (field, order) =>
    set((state) => ({
      sortField: field,
      sortOrder: order || (state.sortField === field && state.sortOrder === 'asc' ? 'desc' : 'asc'),
    })),
  setPage: (page) => set({ page }),
  setIsCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  resetFilters: () =>
    set({
      searchQuery: '',
      statusFilter: 'ALL',
      priorityFilter: 'ALL',
      categoryFilter: 'ALL',
      managerFilter: 'ALL',
      sortField: 'createdAt',
      sortOrder: 'desc',
      page: 1,
    }),
}));
