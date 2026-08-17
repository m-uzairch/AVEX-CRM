'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientProjectOverview } from '@/features/portal/types/portal-types';
import { fetchClientProjectById } from '@/features/portal/services/portal-service';
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  FileText,
  Download,
  MessageSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function ClientProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = React.useState<ClientProjectOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (projectId) {
      fetchClientProjectById(projectId)
        .then(setProject)
        .catch((err) => setError(err?.message || 'Failed to load project.'))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Loading project details...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-12 text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <h2 className="text-lg font-bold">Project Not Found</h2>
        <p className="text-xs text-muted-foreground">{error || 'The requested project could not be loaded.'}</p>
        <Link href="/portal/projects">
          <Button size="sm" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to My Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <Link href="/portal/projects">
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 mt-0.5">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {project.projectCode}
                </span>
                <Badge variant="outline" className="text-xs capitalize font-bold">
                  {project.status.toLowerCase().replace('_', ' ')}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/portal/change-requests">
              <Button variant="outline" size="sm" className="text-xs">
                Request Changes
              </Button>
            </Link>
            <Link href="/portal/messages">
              <Button size="sm" className="gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" /> Message Team
              </Button>
            </Link>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="pt-3 border-t border-border space-y-1.5 max-w-xl">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Overall Completion Progress</span>
            <span className="text-primary font-bold">{project.completionPercentage}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${project.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope, Milestones, Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones Card */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-semibold">Project Milestones</CardTitle>
              <CardDescription>Deliverables checklist and phase progression.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {project.milestones && project.milestones.length > 0 ? (
                <div className="divide-y divide-border">
                  {project.milestones.map((m, idx) => (
                    <div key={m.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center space-x-3">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          m.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {m.status === 'COMPLETED' ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{m.title}</p>
                          {m.description && <p className="text-[11px] text-muted-foreground">{m.description}</p>}
                        </div>
                      </div>

                      <Badge variant="outline" className={`text-[10px] ${m.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold' : 'bg-muted text-muted-foreground'}`}>
                        {m.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No milestones defined for this project.</p>
              )}
            </CardContent>
          </Card>

          {/* Client Files Download Section */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Shared Deliverables & Documents
              </CardTitle>
              <CardDescription>Client-visible project files, contracts, and design assets.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="divide-y divide-border">
                {[
                  { name: 'Project_Scope_Proposal.pdf', size: '2.4 MB', date: '2026-08-01' },
                  { name: 'Design_Wireframes_V1.pdf', size: '8.1 MB', date: '2026-08-02' },
                ].map((file) => (
                  <div key={file.name} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-medium text-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>{file.name}</span>
                      <span className="text-[10px] text-muted-foreground">({file.size})</span>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => alert(`Downloading ${file.name}...`)} className="gap-1.5 text-xs h-7">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Financial & Account Info */}
        <div className="space-y-6">
          {/* Payment Status Card */}
          {project.payments && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-emerald-500" /> Payment & Billing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3 text-xs">
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Budget:</span>
                    <span className="font-bold text-foreground">${project.payments.estimatedBudget.toLocaleString()} {project.payments.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payments Received:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${project.payments.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-bold">
                    <span>Remaining Balance:</span>
                    <span className="text-foreground">${project.payments.remainingBalance.toLocaleString()}</span>
                  </div>
                </div>

                <Badge variant="outline" className="w-full justify-center py-1 text-xs font-bold bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Payment Status: {project.payments.status}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* PM Contact Card */}
          {project.projectManager && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Assigned Project Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2 text-xs">
                <p className="font-bold text-foreground">{project.projectManager.fullName}</p>
                <p className="text-muted-foreground">{project.projectManager.email}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
