'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ProjectDashboardData,
  ProjectTabId,
} from '../../types/project-types';
import {
  Calendar,
  Clock,
  Building,
  Mail,
  Phone,
  DollarSign,
  ListOrdered,
  Plus,
  FileUp,
  MessageSquare,
  ExternalLink,
  Activity as ActivityIcon,
  HeartPulse,
  Send,
} from 'lucide-react';

interface ProjectOverviewGridProps {
  dashboard: ProjectDashboardData;
  onNavigateTab: (tab: ProjectTabId) => void;
  onOpenQuickAction: (action: string) => void;
}

export function ProjectOverviewGrid({
  dashboard,
  onNavigateTab,
  onOpenQuickAction,
}: ProjectOverviewGridProps) {
  const { project, health, timeline, progress, financials, activities, milestones } = dashboard;

  const upcomingMilestones = milestones
    .filter((m) => m.status !== 'COMPLETED')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Status */}
        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className={`p-3 rounded-lg border ${
              health === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              health === 'AT_RISK' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Project Health</p>
              <p className="text-lg font-bold tracking-tight text-foreground">{health}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Duration */}
        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-3 rounded-lg border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Days Remaining</p>
              <p className="text-lg font-bold tracking-tight text-foreground">
                {timeline.remainingDays} Days <span className="text-xs font-normal text-muted-foreground">({timeline.daysElapsed}/{timeline.totalDays} elapsed)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Progress */}
        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-3 rounded-lg border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <ListOrdered className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Milestones</p>
              <p className="text-lg font-bold tracking-tight text-foreground">
                {progress.completedMilestones} / {progress.totalMilestones} Completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-3 rounded-lg border bg-purple-500/10 text-purple-500 border-purple-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Project Budget</p>
              <p className="text-lg font-bold tracking-tight text-foreground">
                ${financials.estimatedBudget.toLocaleString()} <span className="text-xs font-mono">{financials.currency}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card className="bg-gradient-to-r from-card via-card to-primary/5 border-primary/20">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onNavigateTab('milestones')} className="gap-1.5 text-xs bg-card">
              <Plus className="h-3.5 w-3.5" /> Add Milestone
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigateTab('notes')} className="gap-1.5 text-xs bg-card">
              <Plus className="h-3.5 w-3.5" /> Create Note
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenQuickAction('upload_file')} className="gap-1.5 text-xs bg-card">
              <FileUp className="h-3.5 w-3.5" /> Upload File
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenQuickAction('schedule_meeting')} className="gap-1.5 text-xs bg-card">
              <Calendar className="h-3.5 w-3.5" /> Schedule Meeting
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenQuickAction('send_email')} className="gap-1.5 text-xs bg-card">
              <Send className="h-3.5 w-3.5" /> Send Email
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenQuickAction('whatsapp')} className="gap-1.5 text-xs bg-card">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Scope & Timeline Card */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-semibold">Scope & Phase Details</CardTitle>
              <CardDescription>Current project phase and scope overview.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="p-3.5 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">Active Phase</span>
                  <p className="text-sm font-bold text-foreground">{progress.currentPhase}</p>
                </div>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {progress.completionPercentage}% Completed
                </Badge>
              </div>

              {project.description ? (
                <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{project.description}</p>
              ) : (
                <p className="text-xs italic text-muted-foreground">No description provided for this project.</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-border text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold block">Start Date</span>
                  <span className="font-medium text-foreground">{timeline.formattedStartDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold block">Target Due Date</span>
                  <span className="font-medium text-foreground">{timeline.formattedDueDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold block">Duration</span>
                  <span className="font-medium text-foreground">{timeline.totalDays} Total Days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines & Milestones Card */}
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">Upcoming Milestones</CardTitle>
                <CardDescription>Milestones and key deliverables due next.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigateTab('milestones')} className="text-xs">
                View All &rarr;
              </Button>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {upcomingMilestones.length > 0 ? (
                <div className="divide-y divide-border">
                  {upcomingMilestones.map((m) => {
                    const isOverdue = m.dueDate && new Date(m.dueDate) < new Date();
                    return (
                      <div key={m.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">{m.title}</p>
                          {m.description && <p className="text-[11px] text-muted-foreground line-clamp-1">{m.description}</p>}
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <Badge variant="outline" className={`text-[10px] ${isOverdue ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-muted text-muted-foreground'}`}>
                            {m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {m.status.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  All current project milestones have been completed!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Customer Card */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Linked Customer Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {project.customer ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2 font-bold text-foreground text-sm">
                    <Building className="h-4 w-4 text-primary shrink-0" />
                    <span>{project.customer.companyName}</span>
                  </div>
                  <div className="space-y-1 text-muted-foreground pl-6">
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{project.customer.name}</span>
                    </p>
                    {project.customer.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0" /> {project.customer.email}
                      </p>
                    )}
                    {project.customer.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" /> {project.customer.phone}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-border">
                    <Link
                      href={`/crm/customers/${project.customer.id}`}
                      className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Open CRM Profile <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No customer linked to this project.</p>
              )}
            </CardContent>
          </Card>

          {/* Team Members Card */}
          <Card>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Assigned Team ({project.members?.length || 0})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigateTab('team')} className="text-xs h-7 px-2">
                Manage
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {project.members && project.members.length > 0 ? (
                <div className="space-y-2">
                  {project.members.slice(0, 4).map((member) => (
                    <div key={member.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                          {member.user?.fullName
                            ? member.user.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .substring(0, 2)
                            : 'U'}
                        </div>
                        <span className="font-semibold text-foreground truncate max-w-[120px]">
                          {member.user?.fullName}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No team members assigned.</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Feed Card */}
          <Card>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <ActivityIcon className="h-3.5 w-3.5 text-primary" /> Activity Feed
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigateTab('activity')} className="text-xs h-7 px-2">
                All &rarr;
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 4).map((act) => (
                    <div key={act.id} className="text-xs space-y-0.5 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <p className="font-medium text-foreground line-clamp-2">{act.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(act.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No recent activity logged for this project.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
