'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientProjectOverview, ClientProjectPhase } from '@/features/portal/types/portal-types';
import { fetchClientProjectById } from '@/features/portal/services/portal-service';
import { ClientProjectProgressCard } from '@/features/portal/components/client-project-progress-card';
import { ClientProjectTasksView } from '@/features/portal/components/client-project-tasks-view';
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  FileText,
  Download,
  MessageSquare,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  ListTodo,
  Layers,
  ChevronRight,
  Sparkles,
  Flag,
} from 'lucide-react';

export default function ClientProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = React.useState<ClientProjectOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'TASKS' | 'PHASES' | 'FILES'>('TASKS');
  const [taskCategory, setTaskCategory] = React.useState<'ALL' | 'ATTENTION' | 'IN_PROGRESS' | 'TODO' | 'COMPLETED'>('ALL');

  React.useEffect(() => {
    if (projectId) {
      setLoading(true);
      setError(null);
      fetchClientProjectById(projectId)
        .then(setProject)
        .catch((err) => setError(err?.message || 'Failed to load project.'))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  const handleQuickProgressFilter = (filter: 'ALL' | 'ATTENTION' | 'IN_PROGRESS' | 'TODO' | 'COMPLETED') => {
    setTaskCategory(filter);
    setActiveTab('TASKS');
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="font-medium">Loading project workspace details...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Project Not Accessible</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error || 'The requested project could not be found or you do not have permission to view it.'}
        </p>
        <div className="pt-2">
          <Link href="/portal/projects">
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to My Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const phases: ClientProjectPhase[] = project.phases || [];
  const tasks = project.tasks || [];

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Not set';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatLastUpdated = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Bar */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/portal" className="hover:text-foreground transition-colors">
          Portal
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/portal/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-semibold truncate max-w-[200px]">
          {project.name}
        </span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <Link href="/portal/projects">
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 mt-0.5" title="Back to projects">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {project.projectCode}
                </span>
                <Badge
                  variant={
                    project.status === 'COMPLETED'
                      ? 'secondary'
                      : project.status === 'IN_PROGRESS'
                      ? 'default'
                      : project.status === 'ON_HOLD'
                      ? 'destructive'
                      : 'outline'
                  }
                  className="text-xs font-bold"
                >
                  {project.status.replace('_', ' ')}
                </Badge>
                {project.priority && (
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                    <Flag className="h-2.5 w-2.5 mr-1" /> {project.priority}
                  </Badge>
                )}
                {project.category && (
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                    style={{
                      borderColor: `${project.category.color}40`,
                      color: project.category.color,
                      backgroundColor: `${project.category.color}10`,
                    }}
                  >
                    {project.category.name}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>

              {project.description && (
                <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
            <Link href="/portal/change-requests">
              <Button variant="outline" size="sm" className="text-xs">
                Request Changes
              </Button>
            </Link>
            <Link href={`/portal/messages?projectId=${project.id}`}>
              <Button size="sm" className="gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" /> Message Team
              </Button>
            </Link>
          </div>
        </div>

        {/* Dates & Last Updated Metadata Strip */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Start Date: <strong className="text-foreground">{formatDate(project.startDate)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Target Due Date: <strong className="text-foreground">{formatDate(project.expectedCompletionDate)}</strong>
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px]">
            <Clock className="h-3 w-3 text-muted-foreground" /> Last Updated: {formatLastUpdated(project.lastUpdated || project.updatedAt)}
          </span>
        </div>
      </div>

      {/* Project Progress Widget */}
      <ClientProjectProgressCard
        project={project}
        selectedFilter={taskCategory}
        onFilterSelect={handleQuickProgressFilter}
      />

      {/* Next Step Callout Box */}
      {project.nextStep && (
        <Card className="border-l-4 border-l-primary bg-primary/5 shadow-2xs">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold uppercase tracking-wider text-primary text-[11px]">
                Next Step
              </p>
              <blockquote className="border-l-2 border-primary/30 pl-2.5 italic text-foreground font-medium leading-relaxed">
                &ldquo;{project.nextStep}&rdquo;
              </blockquote>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Tabs & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Interactive Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Navigation Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-muted/60 rounded-xl border border-border/80 w-fit">
            <button
              onClick={() => setActiveTab('TASKS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'TASKS'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" /> Project Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('PHASES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'PHASES'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Project Phases ({phases.length})
            </button>
            <button
              onClick={() => setActiveTab('FILES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'FILES'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Documents & Files
            </button>
          </div>

          {/* TAB 1: TASKS & PROGRESS VIEW */}
          {activeTab === 'TASKS' && (
            <ClientProjectTasksView
              tasks={tasks}
              selectedCategory={taskCategory}
              onCategoryChange={setTaskCategory}
            />
          )}

          {/* TAB 2: PHASES */}
          {activeTab === 'PHASES' && (
            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Project Phases & Milestones
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {phases.filter((p) => p.status === 'COMPLETED').length} of {phases.length} completed
                  </span>
                </CardTitle>
                <CardDescription>
                  Review deliverable progression, scheduled deadlines, and the active development phase.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {phases.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
                    <Layers className="h-8 w-8 mx-auto text-muted-foreground/50" />
                    <p className="font-semibold text-foreground">No Project Phases Configured</p>
                    <p>Phases will appear here once defined by your project team.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {phases.map((phase, idx) => {
                      const isCompleted = phase.status === 'COMPLETED';
                      const isCurrent = phase.isCurrent;

                      return (
                        <div
                          key={phase.id || idx}
                          className={`p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
                              : isCompleted
                              ? 'bg-muted/20 border-border/80 opacity-90'
                              : 'bg-card border-border/60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : isCurrent
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-bold text-sm text-foreground">{phase.title}</h4>
                                  {isCurrent && (
                                    <Badge className="text-[10px] bg-primary text-primary-foreground font-bold animate-pulse">
                                      Current Phase
                                    </Badge>
                                  )}
                                </div>
                                {phase.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{phase.description}</p>
                                )}
                              </div>
                            </div>

                            <Badge
                              variant="outline"
                              className={`text-[10px] shrink-0 w-fit ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold'
                                  : isCurrent
                                  ? 'bg-primary/10 text-primary border-primary/20 font-bold'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {phase.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          {/* Phase Progress Bar & Info */}
                          <div className="space-y-1.5 pt-2 border-t border-border/50">
                            <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                              <span>Phase Completion</span>
                              <span className="font-bold text-foreground">{phase.progressPercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isCompleted ? 'bg-emerald-500' : 'bg-primary'
                                }`}
                                style={{ width: `${phase.progressPercentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                              <span>Start: {formatDate(phase.startDate)}</span>
                              <span>Target Due: {formatDate(phase.dueDate || phase.completionDate)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 3: FILES & DELIVERABLES */}
          {activeTab === 'FILES' && (
            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Shared Deliverables & Documents
                </CardTitle>
                <CardDescription>
                  Official client deliverables, signed scopes, wireframes, and final assets.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="divide-y divide-border">
                  {[
                    { name: `${project.projectCode}_Scope_Agreement.pdf`, size: '1.8 MB', date: formatDate(project.startDate) },
                    { name: `${project.projectCode}_Design_Deliverables.zip`, size: '12.4 MB', date: formatLastUpdated(project.lastUpdated) },
                  ].map((file) => (
                    <div key={file.name} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center space-x-2.5 text-xs font-medium text-foreground">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{file.name}</p>
                          <p className="text-[10px] text-muted-foreground">Uploaded {file.date} &bull; {file.size}</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Downloading ${file.name}...`)}
                        className="gap-1.5 text-xs h-8"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: PM & Financial Overview */}
        <div className="space-y-6">
          {/* Project Manager Card */}
          {project.projectManager ? (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" /> Assigned Project Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3 text-xs">
                <div className="flex items-center space-x-3 pt-1">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                    {project.projectManager.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{project.projectManager.fullName}</p>
                    <p className="text-muted-foreground">{project.projectManager.email}</p>
                  </div>
                </div>

                {project.projectManager.phone && (
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                    Phone: <strong className="text-foreground">{project.projectManager.phone}</strong>
                  </p>
                )}

                <Link href={`/portal/messages?projectId=${project.id}`} className="block w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> Message Project Manager
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-4 text-xs text-muted-foreground text-center">
              <User className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />
              <p className="font-semibold text-foreground">Assigned Project Lead</p>
              <p className="text-[11px]">Your workspace lead is coordinating deliverables.</p>
            </Card>
          )}

          {/* Payment & Billing Summary Card */}
          {project.payments && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-500" /> Billing & Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3 text-xs">
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Budget:</span>
                    <span className="font-bold text-foreground">
                      ${project.payments.estimatedBudget.toLocaleString()} {project.payments.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payments Received:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ${project.payments.amountPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-bold">
                    <span>Remaining Balance:</span>
                    <span className="text-foreground">
                      ${project.payments.remainingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`w-full justify-center py-1 text-xs font-bold ${
                    project.payments.status === 'PAID'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}
                >
                  Payment Status: {project.payments.status}
                </Badge>

                <div className="pt-1">
                  <Link href="/portal/invoices" className="block w-full">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
                      View Project Invoices &rarr;
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


