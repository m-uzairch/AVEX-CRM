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

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_001',
    companyId: 'comp_001',
    projectCode: 'AVX-0001',
    name: 'Enterprise CRM Portal Migration',
    description: 'Modernizing internal CRM infrastructure, database migration, and multi-tenant authentication setup.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    startDate: '2026-07-01T00:00:00Z',
    expectedCompletionDate: '2026-09-15T00:00:00Z',
    budget: 45000,
    isArchived: false,
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-08-01T14:30:00Z',
    customer: {
      id: 'cust_001',
      name: 'Sarah Jenkins',
      companyName: 'Acme Corporation',
      email: 'sarah@acme.com',
    },
    projectManager: {
      id: 'usr_001',
      fullName: 'Alex Carter',
      email: 'alex@avexcrm.com',
    },
    category: {
      id: 'cat_001',
      companyId: 'comp_001',
      name: 'CRM & Systems',
      color: '#EC4899',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    members: [
      { id: 'pm_1', projectId: 'proj_001', userId: 'usr_001', role: 'PROJECT_MANAGER', createdAt: '', user: { id: 'usr_001', fullName: 'Alex Carter', email: 'alex@avex.com' } },
      { id: 'pm_2', projectId: 'proj_001', userId: 'usr_002', role: 'MEMBER', createdAt: '', user: { id: 'usr_002', fullName: 'Elena Rostova', email: 'elena@avex.com' } },
      { id: 'pm_3', projectId: 'proj_001', userId: 'usr_003', role: 'MEMBER', createdAt: '', user: { id: 'usr_003', fullName: 'Marcus Vance', email: 'marcus@avex.com' } },
    ],
  },
  {
    id: 'proj_002',
    companyId: 'comp_001',
    projectCode: 'AVX-0002',
    name: 'Mobile iOS & Android App Launch',
    description: 'Native mobile client apps with push notifications, offline storage, and biometric auth.',
    status: 'PLANNING',
    priority: 'URGENT',
    startDate: '2026-08-10T00:00:00Z',
    expectedCompletionDate: '2026-11-30T00:00:00Z',
    budget: 65000,
    isArchived: false,
    createdAt: '2026-07-15T12:00:00Z',
    updatedAt: '2026-08-02T09:00:00Z',
    customer: {
      id: 'cust_002',
      name: 'David Sterling',
      companyName: 'Nexus Global Tech',
      email: 'david@nexus.io',
    },
    projectManager: {
      id: 'usr_002',
      fullName: 'Elena Rostova',
      email: 'elena@avexcrm.com',
    },
    category: {
      id: 'cat_002',
      companyId: 'comp_001',
      name: 'Mobile Application',
      color: '#8B5CF6',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    members: [
      { id: 'pm_4', projectId: 'proj_002', userId: 'usr_002', role: 'PROJECT_MANAGER', createdAt: '', user: { id: 'usr_002', fullName: 'Elena Rostova', email: 'elena@avex.com' } },
      { id: 'pm_5', projectId: 'proj_002', userId: 'usr_004', role: 'MEMBER', createdAt: '', user: { id: 'usr_004', fullName: 'David Kim', email: 'david@avex.com' } },
    ],
  },
  {
    id: 'proj_003',
    companyId: 'comp_001',
    projectCode: 'AVX-0003',
    name: 'E-Commerce Storefront Redesign',
    description: 'Headless Next.js storefront, Stripe checkout integration, and custom inventory sync.',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    startDate: '2026-05-01T00:00:00Z',
    expectedCompletionDate: '2026-07-20T00:00:00Z',
    actualCompletionDate: '2026-07-18T00:00:00Z',
    budget: 28000,
    isArchived: false,
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-07-18T16:00:00Z',
    customer: {
      id: 'cust_003',
      name: 'Chloe Bennett',
      companyName: 'Luxe Apparel Inc',
      email: 'chloe@luxeapparel.com',
    },
    projectManager: {
      id: 'usr_001',
      fullName: 'Alex Carter',
      email: 'alex@avexcrm.com',
    },
    category: {
      id: 'cat_003',
      companyId: 'comp_001',
      name: 'E-commerce',
      color: '#10B981',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    members: [
      { id: 'pm_6', projectId: 'proj_003', userId: 'usr_001', role: 'PROJECT_MANAGER', createdAt: '', user: { id: 'usr_001', fullName: 'Alex Carter', email: 'alex@avex.com' } },
    ],
  },
];

const MOCK_STATS: ProjectStats = {
  totalProjects: 3,
  activeProjects: 2,
  completedProjects: 1,
  overdueProjects: 0,
  totalTeamMembers: 4,
  totalTasks: 24,
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
  const [stats, setStats] = React.useState<ProjectStats>(MOCK_STATS);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);

  const activeTab = (['dashboard', 'all', 'active', 'completed', 'archived'].includes(tabParam)
    ? tabParam
    : 'dashboard') as 'dashboard' | 'all' | 'active' | 'completed' | 'archived';

  React.useEffect(() => {
    fetchProjectCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {});

    fetchProjectStats()
      .then((st) => setStats(st))
      .catch(() => {});
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);

      let effectiveStatus: ProjectStatus | 'ALL' = statusFilter;
      let effectiveIsArchived = false;

      if (activeTab === 'active') {
        effectiveIsArchived = false;
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
      } else if (!searchQuery && statusFilter === 'ALL' && priorityFilter === 'ALL' && categoryFilter === 'ALL' && page === 1) {
        setProjects(MOCK_PROJECTS);
        setTotalPages(1);
      } else {
        setProjects([]);
        setTotalPages(1);
      }
    } catch {
      setProjects(MOCK_PROJECTS);
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
