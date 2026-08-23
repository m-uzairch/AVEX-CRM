'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClientProjectOverview } from '@/features/portal/types/portal-types';
import { fetchClientProjects } from '@/features/portal/services/portal-service';
import {
  FolderKanban,
  User,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  PlayCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function ClientProjectsPage() {
  const [projects, setProjects] = React.useState<ClientProjectOverview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'ALL' | 'IN_PROGRESS' | 'PLANNING' | 'COMPLETED' | 'ON_HOLD'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchClientProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    // Status filter
    if (filter === 'IN_PROGRESS' && p.status !== 'IN_PROGRESS') return false;
    if (filter === 'PLANNING' && p.status !== 'PLANNING' && p.status !== 'PENDING') return false;
    if (filter === 'COMPLETED' && p.status !== 'COMPLETED') return false;
    if (filter === 'ON_HOLD' && p.status !== 'ON_HOLD') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.projectCode.toLowerCase().includes(q);
      const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
      const matchPhase = p.currentPhase.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDesc && !matchPhase) return false;
    }

    return true;
  });

  // Calculate high-level summary KPIs
  const totalCount = projects.length;
  const inProgressCount = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const avgProgress = totalCount > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / totalCount)
    : 0;

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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects Workspace</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track deliverable phases, progression metrics, upcoming next steps, and project workspaces.
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search projects or codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between bg-card/60 shadow-2xs">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Total Projects</p>
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <FolderKanban className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-card/60 shadow-2xs">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">In Progress</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{inProgressCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <PlayCircle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-card/60 shadow-2xs">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-card/60 shadow-2xs">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Avg Completion</p>
            <p className="text-2xl font-bold text-foreground">{avgProgress}%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 p-1 bg-muted/60 rounded-xl border border-border/80 w-fit overflow-x-auto max-w-full">
        {(
          [
            { id: 'ALL', label: 'All Projects' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'PLANNING', label: 'Planning' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'ON_HOLD', label: 'On Hold' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
              <div className="h-5 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground border-dashed bg-card/40">
          <FolderKanban className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">No projects found</p>
          <p className="mt-1">
            {searchQuery
              ? `No projects matched "${searchQuery}". Try a different search term.`
              : 'No project workspaces match the selected filter category.'}
          </p>
          {(filter !== 'ALL' || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="group hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                        {p.projectCode}
                      </Badge>
                      <Badge
                        variant={
                          p.status === 'COMPLETED'
                            ? 'secondary'
                            : p.status === 'IN_PROGRESS'
                            ? 'default'
                            : p.status === 'ON_HOLD'
                            ? 'destructive'
                            : 'outline'
                        }
                        className="text-[10px]"
                      >
                        {p.status.replace('_', ' ')}
                      </Badge>
                      {p.category && (
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: `${p.category.color}40`,
                            color: p.category.color,
                            backgroundColor: `${p.category.color}10`,
                          }}
                        >
                          {p.category.name}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      <Link href={`/portal/projects/${p.id}`}>{p.name}</Link>
                    </h3>
                  </div>

                  <Link href={`/portal/projects/${p.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      View Project <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                {/* Description */}
                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                )}

                {/* Progress Bar with Phase Info */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground truncate max-w-[70%]">
                      Phase: <strong className="text-foreground">{p.currentPhase}</strong>
                    </span>
                    <span className="text-primary font-bold">{p.completionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${p.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Next Step Callout Preview */}
                {p.nextStep && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 text-[11px] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Next Step
                    </span>
                    <p className="text-foreground font-medium line-clamp-1 italic">
                      &ldquo;{p.nextStep}&rdquo;
                    </p>
                  </div>
                )}

                {/* Metadata & Dates Grid */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">Start: {formatDate(p.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Due: {formatDate(p.expectedCompletionDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate justify-end">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>Updated {formatLastUpdated(p.lastUpdated || p.updatedAt)}</span>
                  </div>
                </div>

                {/* Assigned PM Footer */}
                {p.projectManager && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>PM: <strong className="text-foreground">{p.projectManager.fullName}</strong></span>
                    </div>
                    {p.budget && (
                      <span className="font-semibold text-foreground">
                        Budget: ${p.budget.toLocaleString()} {p.currency || 'USD'}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

