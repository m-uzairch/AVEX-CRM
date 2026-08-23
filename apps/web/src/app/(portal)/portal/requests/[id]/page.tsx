'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  ChangeRequest,
  RequestTimelineStep,
  RequestType,
} from '@/features/portal/types/portal-types';
import {
  requestResponseFormSchema,
  RequestResponseFormValues,
} from '@/features/portal/schemas/portal-schemas';
import {
  fetchChangeRequestById,
  addRequestResponse,
  cancelChangeRequest,
} from '@/features/portal/services/portal-service';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FolderKanban,
  ExternalLink,
  Paperclip,
  Send,
  Loader2,
  ChevronRight,
  Sparkles,
  Bug,
  HelpCircle,
  Layers,
  FileEdit,
  MessageSquare,
  User,
  ShieldCheck,
  Ban,
} from 'lucide-react';

export default function ClientRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [requestData, setRequestData] = React.useState<ChangeRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sendingResponse, setSendingResponse] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestResponseFormValues>({
    resolver: zodResolver(requestResponseFormSchema),
    defaultValues: {
      content: '',
      attachmentUrl: '',
    },
  });

  const loadRequest = React.useCallback(async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchChangeRequestById(requestId);
      setRequestData(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  React.useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const onResponseSubmit = async (values: RequestResponseFormValues) => {
    try {
      setSendingResponse(true);
      await addRequestResponse(requestId, values);
      reset();
      await loadRequest();
    } catch (err: any) {
      alert(err?.message || 'Failed to send response.');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setCancelling(true);
      await cancelChangeRequest(requestId);
      setShowCancelModal(false);
      await loadRequest();
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel request.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </Badge>
        );
      case 'APPROVED':
      case 'IN_PROGRESS':
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs font-semibold gap-1">
            <Clock className="h-3.5 w-3.5" /> In Progress
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="default" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-semibold gap-1">
            <Clock className="h-3.5 w-3.5" /> Under Review
          </Badge>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="text-xs font-semibold gap-1">
            <XCircle className="h-3.5 w-3.5" /> {status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
          </Badge>
        );
      case 'SUBMITTED':
      case 'OPEN':
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs font-semibold gap-1">
            <Clock className="h-3.5 w-3.5" /> Submitted / Open
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return <Badge variant="destructive" className="text-xs font-semibold">{priority}</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">{priority}</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground text-xs font-semibold">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type?: RequestType | string) => {
    switch (type) {
      case 'BUG_ISSUE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20">
            <Bug className="h-3.5 w-3.5" /> Bug / Issue
          </span>
        );
      case 'QUESTION':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
            <HelpCircle className="h-3.5 w-3.5" /> Question
          </span>
        );
      case 'GENERAL_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
            <FileEdit className="h-3.5 w-3.5" /> General Request
          </span>
        );
      case 'OTHER':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-500/10 px-2.5 py-0.5 rounded-md border border-slate-500/20">
            <Layers className="h-3.5 w-3.5" /> Other
          </span>
        );
      case 'CHANGE_REQUEST':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" /> Change Request
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="font-medium">Loading request ticket...</span>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Request Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error || 'The requested ticket could not be found or you do not have permission to view it.'}
        </p>
        <div className="pt-2">
          <Link href="/portal/requests">
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Requests
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const timelineSteps: RequestTimelineStep[] = requestData.timeline || [
    {
      key: 'CREATED',
      label: 'Request Created',
      description: 'Submitted by client',
      status: 'completed',
      date: requestData.createdAt,
    },
    {
      key: 'UNDER_REVIEW',
      label: 'Under Review',
      description: 'Reviewing scope and requirements',
      status: requestData.status === 'SUBMITTED' ? 'current' : 'completed',
    },
    {
      key: 'WORK_STARTED',
      label: 'Work Started',
      description: 'Development in progress',
      status: requestData.status === 'APPROVED' ? 'current' : requestData.status === 'COMPLETED' ? 'completed' : 'upcoming',
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      description: 'Deliverable complete and verified',
      status: requestData.status === 'COMPLETED' ? 'completed' : 'upcoming',
    },
  ];

  const canCancel = requestData.status === 'SUBMITTED' || requestData.status === 'UNDER_REVIEW';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Link href="/portal" className="hover:text-foreground transition-colors">
            Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/portal/requests" className="hover:text-foreground transition-colors">
            Requests
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-md">
            {requestData.title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/portal/requests">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Requests
            </Button>
          </Link>

          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowCancelModal(true)}
              className="gap-1.5 text-xs"
            >
              <Ban className="h-4 w-4" /> Cancel Request
            </Button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <Card className="border-border shadow-xs bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {getTypeBadge(requestData.requestType)}
                {getPriorityBadge(requestData.priority)}
                {getStatusBadge(requestData.status)}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {requestData.title}
              </h1>
            </div>

            <div className="text-left md:text-right space-y-1 text-xs text-muted-foreground shrink-0">
              <p className="flex items-center md:justify-end gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Submitted: <span className="font-semibold text-foreground">{new Date(requestData.createdAt).toLocaleDateString()}</span>
              </p>
              <p className="flex items-center md:justify-end gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Last Updated: <span className="font-semibold text-foreground">{new Date(requestData.updatedAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Stepper Timeline Visualizer */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Status Progression Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {timelineSteps.map((step, idx) => {
                let borderClass = 'border-border bg-card/60';
                let icon = <Clock className="h-4 w-4 text-muted-foreground" />;
                let titleClass = 'text-muted-foreground';

                if (step.status === 'completed') {
                  borderClass = 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20';
                  icon = <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
                  titleClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
                } else if (step.status === 'current') {
                  borderClass = 'border-primary bg-primary/5 ring-1 ring-primary/30';
                  icon = <Loader2 className="h-4 w-4 text-primary animate-spin" />;
                  titleClass = 'text-primary font-bold';
                } else if (step.status === 'rejected' || step.status === 'cancelled') {
                  borderClass = 'border-destructive/40 bg-destructive/5 ring-1 ring-destructive/20';
                  icon = <XCircle className="h-4 w-4 text-destructive" />;
                  titleClass = 'text-destructive font-bold';
                }

                return (
                  <div
                    key={step.key || idx}
                    className={`p-3.5 rounded-xl border transition-all ${borderClass} space-y-1.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground">STEP {idx + 1}</span>
                      {icon}
                    </div>
                    <p className={`text-xs ${titleClass}`}>{step.label}</p>
                    {step.description && (
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {step.description}
                      </p>
                    )}
                    {step.date && (
                      <p className="text-[10px] text-muted-foreground pt-1">
                        {new Date(step.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Discussion */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Description */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-primary" /> Request Description & Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground bg-muted/30 p-4 rounded-xl border border-border/50">
                {requestData.description}
              </div>

              {requestData.attachmentUrl && (
                <div className="mt-4 p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <Paperclip className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Attached Resource Document</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-sm">
                        {requestData.attachmentUrl}
                      </p>
                    </div>
                  </div>
                  <a
                    href={requestData.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                      <ExternalLink className="h-3.5 w-3.5" /> Open Attachment
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discussion & Responses Stream */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Communication & Ticket Updates
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {(requestData.responses || []).length} message{(requestData.responses || []).length === 1 ? '' : 's'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* Messages list */}
              {(!requestData.responses || requestData.responses.length === 0) ? (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl p-6">
                  <MessageSquare className="h-6 w-6 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">No Direct Responses Yet</p>
                  <p className="mt-1">
                    Your request has been submitted to the engineering desk. You can post additional notes or instructions below.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requestData.responses.map((resp) => {
                    const isClient = resp.senderType === 'CLIENT';
                    return (
                      <div
                        key={resp.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          isClient
                            ? 'border-border bg-card'
                            : 'border-primary/20 bg-primary/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isClient
                                  ? 'bg-muted text-foreground'
                                  : 'bg-primary text-primary-foreground'
                              }`}
                            >
                              {isClient ? <User className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            </div>
                            <span className="font-bold text-foreground">{resp.senderName}</span>
                            {!isClient && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                Team
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(resp.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-foreground leading-relaxed whitespace-pre-wrap pl-8">
                          {resp.content}
                        </p>

                        {resp.attachmentUrl && (
                          <div className="pl-8 pt-1">
                            <a
                              href={resp.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-primary text-[11px] hover:underline"
                            >
                              <Paperclip className="h-3.5 w-3.5" /> Attachment Link
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSubmit(onResponseSubmit)} className="space-y-3 pt-4 border-t border-border/70">
                <h4 className="text-xs font-bold text-foreground">Post a Reply or Provide Additional Context</h4>
                <div className="space-y-1.5">
                  <Textarea
                    {...register('content')}
                    rows={3}
                    placeholder="Type your message or clarification here..."
                    className="text-xs resize-none"
                  />
                  {errors.content && (
                    <p className="text-destructive text-[11px] font-medium">{errors.content.message}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 max-w-sm">
                    <Input
                      {...register('attachmentUrl')}
                      placeholder="Optional link: https://..."
                      className="text-xs h-9"
                    />
                    {errors.attachmentUrl && (
                      <p className="text-destructive text-[11px] font-medium">{errors.attachmentUrl.message}</p>
                    )}
                  </div>

                  <Button type="submit" size="sm" disabled={sendingResponse} className="gap-2 text-xs font-semibold shrink-0 shadow-xs">
                    {sendingResponse ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Send Response
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata & Project Context */}
        <div className="space-y-6">
          {/* Related Project Card */}
          {requestData.project && (
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border/70">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4 text-primary" /> Associated Project
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                    {requestData.project.projectCode}
                  </span>
                  <h3 className="font-bold text-sm text-foreground mt-1.5">
                    {requestData.project.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <Link href={`/portal/projects/${requestData.project.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      View Project Workspace <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket Information */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ticket Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-mono text-[11px] font-semibold text-foreground truncate max-w-[140px]">
                  {requestData.id}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold text-foreground">
                  {requestData.requestType ? requestData.requestType.replace('_', ' ') : 'Change Request'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Priority Level</span>
                {getPriorityBadge(requestData.priority)}
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Current Status</span>
                {getStatusBadge(requestData.status)}
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-muted-foreground">Creation Date</span>
                <span className="text-foreground">{new Date(requestData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Activity</span>
                <span className="text-foreground">{new Date(requestData.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Advisory Notice */}
          <div className="p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Dedicated Support Commitment</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All requests are directly routed to the lead technical manager and reviewed against your active project roadmap.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center space-x-3 text-destructive">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-foreground">Cancel This Request?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel this ticket? Once cancelled, the status will be marked as cancelled and the project team will not proceed with this task.
            </p>
            <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                className="text-xs"
              >
                No, Keep Open
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={cancelling}
                onClick={handleCancelRequest}
                className="text-xs font-semibold"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
