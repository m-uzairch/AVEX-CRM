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
  DollarSign,
  FileEdit,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function ClientDashboardPage() {
  const [data, setData] = React.useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchClientDashboard()
      .then(setData)
      .catch((err) => setError(err?.message || 'Failed to load client dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Loading client workspace...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <h2 className="text-lg font-bold">Portal Access Required</h2>
        <p className="text-xs text-muted-foreground">{error || 'Please log in to access your client dashboard.'}</p>
        <Link href="/portal/login">
          <Button size="sm">Go to Login</Button>
        </Link>
      </div>
    );
  }

  const { client, activeProjects, completedProjectsCount, pendingPaymentsTotal, recentChangeRequests } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Client Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {client.name}!
          </h1>
          <p className="text-xs text-muted-foreground">
            {client.customer?.companyName} • Track real-time progress for your active deliverables and milestone approvals.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link href="/portal/change-requests">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs bg-card">
              <Plus className="h-3.5 w-3.5" /> Submit Change Request
            </Button>
          </Link>
          <Link href="/portal/messages">
            <Button size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" /> Project Messages
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-3 rounded-lg border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Projects</p>
              <p className="text-lg font-bold tracking-tight text-foreground">{activeProjects.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-3 rounded-lg border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Completed Projects</p>
              <p className="text-lg font-bold tracking-tight text-foreground">{completedProjectsCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-3 rounded-lg border bg-amber-500/10 text-amber-500 border-amber-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending Payments Balance</p>
              <p className="text-lg font-bold tracking-tight text-foreground">
                ${pendingPaymentsTotal.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-3 rounded-lg border bg-purple-500/10 text-purple-500 border-purple-500/20">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Submitted Requests</p>
              <p className="text-lg font-bold tracking-tight text-foreground">{recentChangeRequests.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Your Active Projects</h2>
            <Link href="/portal/projects" className="text-xs text-primary font-medium hover:underline">
              View All Projects &rarr;
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No active projects currently underway.
            </Card>
          ) : (
            <div className="space-y-4">
              {activeProjects.map((p) => (
                <Card key={p.id} className="hover:border-primary/40 transition-all duration-200 shadow-xs">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {p.projectCode}
                          </span>
                          <Badge variant="outline" className="text-[10px] capitalize font-medium">
                            {p.status.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-base text-foreground">{p.name}</h3>
                      </div>

                      <Link href={`/portal/projects/${p.id}`}>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                          Workspace Details <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Active Phase: {p.currentPhase}</span>
                        <span className="text-primary font-bold">{p.completionPercentage}% Completed</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${p.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Payment Summary Box */}
                    {p.payments && (
                      <div className="p-3 rounded-lg border border-border bg-muted/20 flex flex-wrap items-center justify-between text-xs gap-2">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Total Cost</span>
                          <span className="font-bold text-foreground">${p.payments.estimatedBudget.toLocaleString()} {p.payments.currency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Amount Paid</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">${p.payments.amountPaid.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Remaining Balance</span>
                          <span className="font-bold text-foreground">${p.payments.remainingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Change Requests & Manager Contact */}
        <div className="space-y-6">
          {/* Change Requests Card */}
          <Card>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Change Requests ({recentChangeRequests.length})
              </CardTitle>
              <Link href="/portal/change-requests" className="text-xs text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {recentChangeRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground">No change requests submitted.</p>
              ) : (
                <div className="space-y-3">
                  {recentChangeRequests.slice(0, 3).map((cr) => (
                    <div key={cr.id} className="p-2.5 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground truncate max-w-[140px]">{cr.title}</span>
                        <Badge variant="outline" className="text-[9px]">
                          {cr.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{cr.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Manager Card */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Your Account Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                  AV
                </div>
                <div>
                  <p className="font-bold text-foreground">AVEX Client Success Team</p>
                  <p className="text-[11px] text-muted-foreground">support@avexcrm.com</p>
                </div>
              </div>
              <Link href="/portal/messages">
                <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 mt-2">
                  <MessageSquare className="h-3.5 w-3.5" /> Contact Account Lead
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
