'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectLayout } from '@/features/projects/components/project-layout';
import { ProjectStatsCards } from '@/features/projects/components/project-stats';
import { ProjectFilters } from '@/features/projects/components/project-filters';
import { ProjectCard } from '@/features/projects/components/project-card';
import { ProjectTable } from '@/features/projects/components/project-table';
import { ProjectDialog } from '@/features/projects/components/project-dialog';
import { ProjectEmptyState } from '@/features/projects/components/project-empty-state';
import { ProjectGridSkeleton, ProjectTableSkeleton } from '@/features/projects/components/project-skeletons';
import { useProjectStore } from '@/features/projects/stores/project-store';
import {
  fetchProjects,
  fetchProjectStats,
  fetchProjectCategories,
  createProject,
  updateProject,
  deleteProject,
} from '@/features/projects/services/project-service';
import {
  Project,
  ProjectCategory,
  ProjectStats,
  ProjectStatus,
} from '@/features/projects/types/project-types';
import { Pagination } from '@/components/ui/pagination';

const INITIAL_ZERO_STATS: ProjectStats = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  overdueProjects: 0,
  totalTeamMembers: 0,
  totalTasks: 0,
};

function ProjectsContent() {
  const searchParams = useSearchParams();

  const tabParam = searchParams?.get('tab') || 'dashboard';

  const {
    viewMode,
    searchQuery,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortField,
    sortOrder,
    page,
    pageSize,
    isCreateModalOpen,
    setSort,
    setPage,
    setIsCreateModalOpen,
  } = useProjectStore();

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [categories, setCategories] = React.useState<ProjectCategory[]>([]);
  const [stats, setStats] = React.useState<ProjectStats>(INITIAL_ZERO_STATS);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);

  const activeTab = (['dashboard', 'all', 'active', 'completed', 'archived'].includes(tabParam)
    ? tabParam
    : 'dashboard') as 'dashboard' | 'all' | 'active' | 'completed' | 'archived';

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);

      const [cats, statsData] = await Promise.all([
        fetchProjectCategories().catch(() => []),
        fetchProjectStats().catch(() => INITIAL_ZERO_STATS),
      ]);

      setCategories(cats);
      setStats(statsData || INITIAL_ZERO_STATS);

      let effectiveStatus: ProjectStatus | 'ALL' = statusFilter;
      let effectiveIsArchived = false;

      if (activeTab === 'active') {
        effectiveStatus = 'IN_PROGRESS';
      } else if (activeTab === 'completed') {
        effectiveStatus = 'COMPLETED';
      } else if (activeTab === 'archived') {
        effectiveIsArchived = true;
      }

      const res = await fetchProjects({
        search: searchQuery,
        status: effectiveStatus,
        priority: priorityFilter,
        categoryId: categoryFilter,
        isArchived: effectiveIsArchived,
        page,
        pageSize,
        sortField,
        sortOrder,
      });

      if (res.data && res.data.length > 0) {
        setProjects(res.data);
        setTotalPages(res.totalPages);
      } else {
        setProjects([]);
        setTotalPages(1);
      }
    } catch {
      setProjects([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, activeTab, page, pageSize, sortField, sortOrder]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOrUpdateProject = async (values: any) => {
    if (editingProject) {
      await updateProject(editingProject.id, values);
    } else {
      await createProject(values);
    }
    setEditingProject(null);
    loadData();
    fetchProjectStats().then(setStats).catch(() => {});
  };

  const handleArchiveProject = async (project: Project) => {
    await updateProject(project.id, { isArchived: !project.isArchived });
    loadData();
    fetchProjectStats().then(setStats).catch(() => {});
  };

  const handleDeleteProject = async (project: Project) => {
    if (confirm(`Are you sure you want to delete project ${project.projectCode}?`)) {
      await deleteProject(project.id);
      loadData();
      fetchProjectStats().then(setStats).catch(() => {});
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsCreateModalOpen(true);
  };

  const handleExportCSV = () => {
    if (projects.length === 0) return;
    const headers = ['Code', 'Name', 'Customer', 'Status', 'Priority', 'Budget', 'Due Date'];
    const rows = projects.map((p) => [
      p.projectCode,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.customer?.companyName || ''}"`,
      p.status,
      p.priority,
      p.budget || 0,
      p.expectedCompletionDate ? p.expectedCompletionDate.split('T')[0] : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `avex-projects-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProjectLayout activeTab={activeTab}>
      {/* Dashboard KPI Stat Cards */}
      <ProjectStatsCards stats={stats} loading={loading && projects.length === 0} />

      {/* Filter and Search Bar */}
      <ProjectFilters categories={categories} onExport={handleExportCSV} />

      {/* Projects List / Grid View */}
      {loading ? (
        viewMode === 'grid' ? (
          <ProjectGridSkeleton count={6} />
        ) : (
          <ProjectTableSkeleton rows={5} />
        )
      ) : projects.length === 0 ? (
        <ProjectEmptyState onCreateNew={() => setIsCreateModalOpen(true)} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditClick}
              onArchive={handleArchiveProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <ProjectTable
          projects={projects}
          onEdit={handleEditClick}
          onArchive={handleArchiveProject}
          onDelete={handleDeleteProject}
          onSort={(field) => setSort(field)}
        />
      )}

      {/* Pagination Footer */}
      {!loading && projects.length > 0 && totalPages > 1 && (
        <div className="pt-4 flex justify-end">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Project Create / Edit Dialog Modal */}
      <ProjectDialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setEditingProject(null);
        }}
        onSubmit={handleCreateOrUpdateProject}
        project={editingProject}
        categories={categories}
      />
    </ProjectLayout>
  );
}

export default function ProjectsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading projects...</div>}>
      <ProjectsContent />
    </React.Suspense>
  );
}
