'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientDashboardData } from '@/features/portal/types/portal-types';
import { fetchClientDashboard } from '@/features/portal/services/portal-service';
import {
  FolderKanban,
  FileEdit,
  FileCheck,
  FileText,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Plus,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Video,
  Activity,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export default function ClientDashboardPage() {
  const [data, setData] = React.useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDashboard = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchClientDashboard();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-8 font-sans animate-pulse">
        {/* Welcome Skeleton */}
        <div className="h-32 rounded-2xl bg-muted/60 border border-border" />

        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/40 border border-border p-4 space-y-3">
              <div className="h-4 w-24 bg-muted/80 rounded" />
              <div className="h-7 w-16 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted/60 rounded" />
            </div>
          ))}
        </div>

        {/* Body Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-muted/40 border border-border" />
          <div className="h-96 rounded-2xl bg-muted/40 border border-border" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="p-3 bg-destructive/10 text-destructive rounded-full w-12 h-12 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Dashboard Unavailable</h2>
          <p className="text-xs text-muted-foreground">{error || 'Could not fetch your account workspace.'}</p>
        </div>
        <Button onClick={loadDashboard} variant="outline" size="sm" className="gap-2 font-bold">
          <RefreshCw className="h-4 w-4" /> Retry Loading
        </Button>
      </div>
    );
  }

  const {
    client,
    summary,
    financialOverview,
    activeProjects,
    recentActivity,
    pendingQuotations,
    outstandingInvoices,
    upcomingMeetings,
    recentChangeRequests,
  } = data;

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Dynamic Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-card border border-primary/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Client Portal Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back, {client?.name?.split(' ')[0] || 'Client'}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Here is your live status for {client?.customer?.companyName || 'your account'}. You have{' '}
            <strong className="text-foreground">{summary?.activeProjectsCount || 0} active projects</strong> and{' '}
            <strong className="text-foreground">{summary?.unpaidInvoicesCount || 0} outstanding invoices</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/portal/requests">
            <Button size="sm" className="gap-1.5 text-xs font-bold shadow-xs">
              <Plus className="h-4 w-4" /> New Request
            </Button>
          </Link>
          <Link href="/portal/meetings">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <Calendar className="h-4 w-4" /> Book Meeting
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Active Projects */}
        <Link href="/portal/projects" className="block">
          <Card className="hover:border-primary/50 transition-all duration-200 shadow-xs cursor-pointer h-full">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Projects
              </CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <FolderKanban className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-black text-foreground">
                {summary?.activeProjectsCount ?? activeProjects.length}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 inline" />
                <span>{summary?.completedProjectsCount ?? 0} completed</span>
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 2: Pending Quotations */}
        <Link href="/portal/quotations" className="block">
          <Card className="hover:border-primary/50 transition-all duration-200 shadow-xs cursor-pointer h-full">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quotations
              </CardTitle>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <FileCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-black text-foreground">
                {summary?.pendingQuotationsCount ?? pendingQuotations.length}
              </div>
              <p className="text-[11px] text-muted-foreground truncate" title={summary?.mostRecentQuotation ? `Latest: $${summary.mostRecentQuotation.totalAmount.toLocaleString()}` : 'No pending estimates'}>
                {summary?.mostRecentQuotation
                  ? `Latest: $${summary.mostRecentQuotation.totalAmount.toLocaleString()}`
                  : 'All quotations reviewed'}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 3: Outstanding Invoices */}
        <Link href="/portal/invoices" className="block">
          <Card className="hover:border-primary/50 transition-all duration-200 shadow-xs cursor-pointer h-full">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Unpaid Invoices
              </CardTitle>
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-black text-foreground">
                {summary?.unpaidInvoicesCount ?? outstandingInvoices.length}
              </div>
              <p className="text-[11px] font-semibold text-destructive">
                ${(summary?.totalOutstandingAmount ?? 0).toLocaleString()} due
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 4: Upcoming Meetings */}
        <Link href="/portal/meetings" className="block">
          <Card className="hover:border-primary/50 transition-all duration-200 shadow-xs cursor-pointer h-full">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Next Meeting
              </CardTitle>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-sm font-bold text-foreground truncate">
                {summary?.nextMeeting?.title || (upcomingMeetings[0] ? upcomingMeetings[0].title : 'No upcoming')}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                <Clock className="h-3 w-3 inline shrink-0" />
                <span>
                  {summary?.nextMeeting?.startTime
                    ? new Date(summary.nextMeeting.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    : upcomingMeetings[0]
                    ? new Date(upcomingMeetings[0].startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    : 'Schedule a sync'}
                </span>
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 5: Open Requests */}
        <Link href="/portal/requests" className="block">
          <Card className="hover:border-primary/50 transition-all duration-200 shadow-xs cursor-pointer h-full">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Open Requests
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <FileEdit className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-black text-foreground">
                {summary?.openRequestsCount ?? recentChangeRequests.length}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {summary?.mostRecentRequest?.title || (recentChangeRequests[0] ? recentChangeRequests[0].title : 'No active tickets')}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. Main Dashboard Grid: Projects & Financials + Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Active Projects & Financial Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Projects Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Active Projects</h2>
              </div>
              <Link href="/portal/projects" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                View All Projects <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground border-dashed">
                <FolderKanban className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No Active Projects</p>
                <p className="mt-1">You currently have no projects in progress. Contact your account manager to initiate work.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="hover:border-primary/50 transition-all duration-200 shadow-xs flex flex-col justify-between"
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] text-muted-foreground block">
                            {project.projectCode}
                          </span>
                          <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                            <Link href={`/portal/projects/${project.id}`}>{project.name}</Link>
                          </h3>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">{project.completionPercentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Phase / Next Step info */}
                      <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60 space-y-1">
                        <div className="flex justify-between">
                          <span>Next Step:</span>
                          <span className="font-medium text-foreground truncate max-w-[140px]">
                            {project.nextStep || project.currentPhase}
                          </span>
                        </div>
                        {project.projectManager && (
                          <div className="flex justify-between">
                            <span>Lead:</span>
                            <span className="font-medium text-foreground">{project.projectManager.fullName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-muted-foreground">
                        Updated {project.lastUpdated ? new Date(project.lastUpdated).toLocaleDateString() : 'recently'}
                      </span>
                      <Link
                        href={`/portal/projects/${project.id}`}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-xs"
                      >
                        Workspace <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Financial Overview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Financial Summary</h2>
              </div>
              <Link href="/portal/invoices" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                View Statements <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <Card className="shadow-xs">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-1">
                    <span className="text-[11px] font-bold text-destructive uppercase tracking-wider block">
                      Outstanding Invoices
                    </span>
                    <div className="text-2xl font-black text-foreground">
                      ${(financialOverview?.outstandingAmount ?? 0).toLocaleString()}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      {financialOverview?.unpaidInvoicesCount ?? outstandingInvoices.length} unpaid bill(s)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      Total Paid
                    </span>
                    <div className="text-2xl font-black text-foreground">
                      ${(financialOverview?.paidAmount ?? 0).toLocaleString()}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      {financialOverview?.paidInvoicesCount ?? 0} settled invoice(s)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      Pending Quotations
                    </span>
                    <div className="text-2xl font-black text-foreground">
                      ${(financialOverview?.pendingQuotationsAmount ?? 0).toLocaleString()}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      {financialOverview?.pendingQuotationsCount ?? pendingQuotations.length} active estimate(s)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right 1 Column: Recent Activity & Next Video Meeting */}
        <div className="space-y-6">
          {/* Upcoming Video Meeting Card */}
          {upcomingMeetings.length > 0 && (
            <Card className="border-primary/30 bg-primary/5 shadow-xs">
              <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold">Next Scheduled Sync</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] bg-card">
                  {upcomingMeetings[0].meetingType}
                </Badge>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{upcomingMeetings[0].title}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {new Date(upcomingMeetings[0].startTime).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(upcomingMeetings[0].startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                </div>

                {upcomingMeetings[0].meetingLink && (
                  <a
                    href={upcomingMeetings[0].meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button size="sm" className="w-full gap-1.5 font-bold text-xs">
                      <Video className="h-3.5 w-3.5" /> Join Video Call
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity Timeline */}
          <Card className="shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
              </div>
              <span className="text-[10px] text-muted-foreground">Live Feed</span>
            </CardHeader>
            <CardContent className="p-5">
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start space-x-3 text-xs">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <Link href={act.link || '#'} className="font-bold text-foreground hover:underline">
                            {act.title}
                          </Link>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No recent activity recorded for your account.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security & Support banner */}
          <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground space-y-2">
            <div className="flex items-center space-x-2 text-foreground font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Dedicated Support</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Have questions regarding your deliverables or milestones? Submit a request or get in touch directly via the communication tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
