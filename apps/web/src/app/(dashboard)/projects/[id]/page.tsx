'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ContentContainer } from '@/components/layout/content-container';
import { Button } from '@/components/ui/button';
import { ProjectHeader360 } from '@/features/projects/components/dashboard/project-header-360';
import { ProjectTabsNav } from '@/features/projects/components/dashboard/project-tabs-nav';
import { ProjectOverviewGrid } from '@/features/projects/components/dashboard/project-overview-grid';
import { ProjectNotesTab } from '@/features/projects/components/dashboard/project-notes-tab';
import { ProjectMilestonesTab } from '@/features/projects/components/dashboard/project-milestones-tab';
import { ProjectTeamTab } from '@/features/projects/components/dashboard/project-team-tab';
import { ProjectActivityTab } from '@/features/projects/components/dashboard/project-activity-tab';
import { ProjectTasksTab } from '@/features/projects/components/dashboard/project-tasks-tab';
import { ProjectFilesTab } from '@/features/projects/components/dashboard/project-files-tab';
import { ProjectPlaceholderTab } from '@/features/projects/components/dashboard/project-placeholder-tab';
import { ProjectMeetingsTab } from '@/features/communication/components/project-meetings-tab';
import { ProjectDialog } from '@/features/projects/components/project-dialog';
import { ProjectGridSkeleton } from '@/features/projects/components/project-skeletons';
import { CompletionWizardModal } from '@/features/projects/components/completion/completion-wizard-modal';
import { FinalCompletionReportModal } from '@/features/projects/components/completion/final-completion-report-modal';
import { ProjectHistoryTimeline } from '@/features/projects/components/completion/project-history-timeline';
import {
  fetchProjectDashboard,
  duplicateProject,
} from '@/features/projects/services/project-dashboard-service';
import { updateProject } from '@/features/projects/services/project-service';
import { ProjectDashboardData, ProjectTabId } from '@/features/projects/types/project-types';
import { AlertCircle, ArrowLeft } from 'lucide-react';

function ProjectDashboardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = (params?.id as string) || '';

  const activeTabParam = (searchParams?.get('tab') as ProjectTabId) || 'overview';

  const [dashboard, setDashboard] = React.useState<ProjectDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<ProjectTabId>(activeTabParam);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeliverWizardOpen, setIsDeliverWizardOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);

  const loadDashboard = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjectDashboard(projectId);
      setDashboard(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load project dashboard.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    if (projectId) {
      loadDashboard();
    }
  }, [projectId, loadDashboard]);

  const handleUpdateProject = async (values: any) => {
    if (!dashboard) return;
    await updateProject(dashboard.project.id, values);
    setIsEditModalOpen(false);
    loadDashboard();
  };

  const handleArchiveProject = async () => {
    if (!dashboard) return;
    try {
      if (dashboard.project.isArchived) {
        await fetch(`/api/projects/${dashboard.project.id}/restore`, { method: 'POST' });
      } else {
        await fetch(`/api/projects/${dashboard.project.id}/archive`, { method: 'POST' });
      }
      loadDashboard();
    } catch (err) {
      console.error('Failed to toggle archive status:', err);
    }
  };

  const handleDuplicateProject = async () => {
    if (!dashboard) return;
    try {
      const duplicated = await duplicateProject(dashboard.project.id);
      router.push(`/projects/${duplicated.id}`);
    } catch (err) {
      console.error('Failed to duplicate project:', err);
    }
  };

  const handleTabChange = (tab: ProjectTabId) => {
    setActiveTab(tab);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'upload_file':
        setActiveTab('files');
        break;
      case 'schedule_meeting':
        setActiveTab('meetings');
        break;
      case 'send_email':
        if (dashboard?.project.customer?.email) {
          window.location.href = `mailto:${dashboard.project.customer.email}`;
        } else {
          alert('No customer email associated with this project.');
        }
        break;
      case 'whatsapp':
        if (dashboard?.project.customer?.phone) {
          window.open(`https://wa.me/${dashboard.project.customer.phone.replace(/\D/g, '')}`, '_blank');
        } else {
          alert('No customer phone number registered.');
        }
        break;
    }
  };

  if (loading) {
    return (
      <ContentContainer>
        <div className="py-6">
          <ProjectGridSkeleton count={2} />
        </div>
      </ContentContainer>
    );
  }

  if (error || !dashboard) {
    return (
      <ContentContainer>
        <div className="py-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">Project Not Found</h2>
          <p className="text-sm text-muted-foreground">{error || 'The requested project workspace could not be loaded.'}</p>
          <Button variant="outline" onClick={() => router.push('/projects')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Projects List
          </Button>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      {/* 360 Degree Header */}
      <ProjectHeader360
        project={dashboard.project}
        health={dashboard.health}
        progress={dashboard.progress}
        onEdit={() => setIsEditModalOpen(true)}
        onArchive={handleArchiveProject}
        onDuplicate={handleDuplicateProject}
        onDeliver={() => setIsDeliverWizardOpen(true)}
        onReport={() => setIsReportModalOpen(true)}
      />

      {/* Navigation Tabs */}
      <ProjectTabsNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={{
          milestonesCount: dashboard.milestones.length,
          notesCount: dashboard.notes.length,
          membersCount: dashboard.project.members?.length,
        }}
      />

      {/* Tab Content Panels */}
      {activeTab === 'overview' && (
        <ProjectOverviewGrid
          dashboard={dashboard}
          onNavigateTab={handleTabChange}
          onOpenQuickAction={handleQuickAction}
        />
      )}

      {activeTab === 'notes' && (
        <ProjectNotesTab
          projectId={projectId}
          notes={dashboard.notes}
          onNotesUpdated={loadDashboard}
        />
      )}

      {activeTab === 'milestones' && (
        <ProjectMilestonesTab
          projectId={projectId}
        />
      )}

      {activeTab === 'team' && (
        <ProjectTeamTab
          project={dashboard.project}
          onManageTeam={() => setIsEditModalOpen(true)}
        />
      )}

      {activeTab === 'activity' && (
        <ProjectActivityTab activities={dashboard.activities} />
      )}

      {activeTab === 'history' && (
        <ProjectHistoryTimeline projectId={projectId} />
      )}

      {activeTab === 'tasks' && <ProjectTasksTab projectId={projectId} />}

      {activeTab === 'files' && <ProjectFilesTab projectId={projectId} />}

      {activeTab === 'meetings' && <ProjectMeetingsTab projectId={projectId} />}

      {['reports'].includes(activeTab) && (
        <ProjectPlaceholderTab tabId={activeTab} />
      )}

      {/* Edit Modal */}
      <ProjectDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateProject}
        project={dashboard.project}
      />

      {/* Completion & Delivery Wizard Modal */}
      <CompletionWizardModal
        isOpen={isDeliverWizardOpen}
        onClose={() => setIsDeliverWizardOpen(false)}
        projectId={projectId}
        projectCode={dashboard.project.projectCode}
        projectName={dashboard.project.name}
        onDeliveryComplete={loadDashboard}
      />

      {/* Final Completion Report Modal */}
      <FinalCompletionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        projectId={projectId}
      />
    </ContentContainer>
  );
}

export default function ProjectDashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading project...</div>}>
      <ProjectDashboardContent />
    </React.Suspense>
  );
}
