'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '../stores/task-store';
import { TaskStatus, TaskPriority } from '../types/task-types';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  RotateCcw,
  Plus,
} from 'lucide-react';

export function TaskFilters() {
  const {
    viewMode,
    searchQuery,
    statusFilter,
    priorityFilter,
    setViewMode,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setIsCreateModalOpen,
    resetFilters,
  } = useTaskStore();

  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title, project, or labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs"
          />
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`gap-1.5 text-xs ${showAdvanced || hasActiveFilters ? 'border-primary text-primary' : ''}`}
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {hasActiveFilters && <span className="ml-1 h-2 w-2 rounded-full bg-primary" />}
          </Button>

          {/* View Switcher Toggle */}
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-card">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('kanban')}
              title="Kanban View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('calendar')}
              title="Calendar View"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 shadow-xs text-xs">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      {showAdvanced && (
        <div className="p-4 rounded-lg border border-border bg-card/60 backdrop-blur-xs grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in-50 duration-200">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
              className="w-full text-xs rounded-md border border-input bg-background p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
              className="w-full text-xs rounded-md border border-input bg-background p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-2 flex justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
