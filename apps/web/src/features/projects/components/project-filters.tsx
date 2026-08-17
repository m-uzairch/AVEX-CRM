import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '../stores/project-store';
import { ProjectCategory, ProjectStatus, ProjectPriority } from '../types/project-types';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  Download,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

interface ProjectFiltersProps {
  categories?: ProjectCategory[];
  onExport?: () => void;
}

export function ProjectFilters({ categories = [], onExport }: ProjectFiltersProps) {
  const {
    viewMode,
    searchQuery,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortField,
    sortOrder,
    setViewMode,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    setSort,
    setIsCreateModalOpen,
    resetFilters,
  } = useProjectStore();

  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL';

  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, code, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`gap-1.5 ${showAdvanced || hasActiveFilters ? 'border-primary text-primary' : ''}`}
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-card">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5 hidden md:flex">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          )}

          <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      {showAdvanced && (
        <div className="p-4 rounded-lg border border-border bg-card/60 backdrop-blur-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in-50 duration-200">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'ALL')}
              className="w-full text-xs rounded-md border border-input bg-background p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
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

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as ProjectPriority | 'ALL')}
              className="w-full text-xs rounded-md border border-input bg-background p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs rounded-md border border-input bg-background p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
              Sort By
            </label>
            <div className="flex items-center space-x-1">
              <select
                value={sortField}
                onChange={(e) =>
                  setSort(
                    e.target.value as 'name' | 'createdAt' | 'expectedCompletionDate' | 'priority' | 'status'
                  )
                }
                className="w-full text-xs rounded-md border border-input bg-background p-2 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Project Name</option>
                <option value="expectedCompletionDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setSort(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
