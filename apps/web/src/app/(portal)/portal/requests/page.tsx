'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChangeRequest, RequestType } from '@/features/portal/types/portal-types';
import { fetchChangeRequests } from '@/features/portal/services/portal-service';
import {
  FileEdit,
  Plus,
  Loader2,
  Calendar,
  FolderKanban,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ArrowRight,
  Filter,
  Bug,
  HelpCircle,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

export default function ClientRequestsPage() {
  const [requests, setRequests] = React.useState<ChangeRequest[]>([]);
  const [kpis, setKpis] = React.useState({
    total: 0,
    open: 0,
    inReview: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('ALL');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchChangeRequests({
        status: statusFilter,
        type: typeFilter,
        search: searchQuery,
      });
      setRequests(res.requests || []);
      if (res.kpis) {
        setKpis(res.kpis);
      } else {
        // Fallback KPI calculation
        const reqList = res.requests || [];
        setKpis({
          total: reqList.length,
          open: reqList.filter((r) => r.status === 'SUBMITTED' || r.status === 'OPEN').length,
          inReview: reqList.filter((r) => r.status === 'UNDER_REVIEW').length,
          inProgress: reqList.filter((r) => r.status === 'APPROVED').length,
          completed: reqList.filter((r) => r.status === 'COMPLETED').length,
        });
      }
    } catch (err) {
      console.error('Failed to load client requests:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'APPROVED':
      case 'IN_PROGRESS':
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs font-semibold gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="default" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-semibold gap-1">
            <Clock className="h-3 w-3" /> Under Review
          </Badge>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="text-xs font-semibold gap-1">
            <XCircle className="h-3 w-3" /> {status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
          </Badge>
        );
      case 'SUBMITTED':
      case 'OPEN':
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs font-semibold gap-1">
            <Clock className="h-3 w-3" /> Open / Submitted
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return <Badge variant="destructive" className="text-[11px] font-semibold">{priority}</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-semibold">{priority}</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground text-[11px] font-semibold">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type?: RequestType | string) => {
    switch (type) {
      case 'BUG_ISSUE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            <Bug className="h-3 w-3" /> Bug / Issue
          </span>
        );
      case 'QUESTION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
            <HelpCircle className="h-3 w-3" /> Question
          </span>
        );
      case 'GENERAL_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
            <FileEdit className="h-3 w-3" /> General Request
          </span>
        );
      case 'OTHER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-md border border-slate-500/20">
            <Layers className="h-3 w-3" /> Other
          </span>
        );
      case 'CHANGE_REQUEST':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
            <Sparkles className="h-3 w-3" /> Change Request
          </span>
        );
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileEdit className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Requests</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Submit scope additions, revision tickets, or support requests directly to your dedicated team.
          </p>
        </div>

        <Link href="/portal/requests/new">
          <Button className="gap-2 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-muted-foreground">Total Requests</p>
          <p className="text-2xl font-bold text-foreground mt-1">{kpis.total}</p>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Open / Under Review</p>
          <p className="text-2xl font-bold text-foreground mt-1">{kpis.open + kpis.inReview}</p>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-2xl font-bold text-foreground mt-1">{kpis.inProgress}</p>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Completed</p>
          <p className="text-2xl font-bold text-foreground mt-1">{kpis.completed}</p>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-3 bg-card border-border">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, project, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-background border border-input rounded-md px-2.5 py-1">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open / Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected / Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-background border border-input rounded-md px-2.5 py-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Request Types</option>
                <option value="CHANGE_REQUEST">Change Request</option>
                <option value="BUG_ISSUE">Bug / Issue</option>
                <option value="GENERAL_REQUEST">General Request</option>
                <option value="QUESTION">Question</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-background border border-input rounded-md px-2.5 py-1">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title="Refresh requests"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      {loading ? (
        <div className="py-24 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="font-medium">Loading client requests...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground border-dashed">
          <FileEdit className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground">No Requests Found</p>
          <p className="mt-1 mb-5 max-w-sm mx-auto text-xs text-muted-foreground">
            {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'No requests match your selected filters. Try resetting your search parameters.'
              : 'You have not submitted any project requests or change tickets yet.'}
          </p>
          <Link href="/portal/requests/new">
            <Button size="sm" className="gap-2 text-xs font-semibold shadow-xs">
              <Plus className="h-4 w-4" /> Submit New Request
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((r) => (
            <Link key={r.id} href={`/portal/requests/${r.id}`} className="block group">
              <Card className="hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs group-hover:bg-muted/20">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(r.requestType)}
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {getPriorityBadge(r.priority)}
                      {getStatusBadge(r.status)}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground pt-2.5 border-t border-border/60">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Submitted on {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                      {r.project && (
                        <span className="flex items-center gap-1 font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded">
                          <FolderKanban className="h-3.5 w-3.5 text-primary" />
                          [{r.project.projectCode}] {r.project.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-primary font-medium text-xs group-hover:translate-x-0.5 transition-transform">
                      <span>View details & timeline</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
