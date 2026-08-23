'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ClientProjectOverview, RequestType } from '@/features/portal/types/portal-types';
import {
  changeRequestFormSchema,
  ChangeRequestFormValues,
} from '@/features/portal/schemas/portal-schemas';
import {
  fetchClientProjects,
  createChangeRequest,
} from '@/features/portal/services/portal-service';
import {
  FileEdit,
  ArrowLeft,
  Loader2,
  ChevronRight,
  Sparkles,
  Bug,
  HelpCircle,
  Layers,
  AlertCircle,
  Send,
  Info,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';

export default function NewClientRequestPage() {
  const router = useRouter();
  const [projects, setProjects] = React.useState<ClientProjectOverview[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChangeRequestFormValues>({
    resolver: zodResolver(changeRequestFormSchema),
    defaultValues: {
      projectId: '',
      title: '',
      requestType: 'CHANGE_REQUEST',
      description: '',
      priority: 'MEDIUM',
      attachmentUrl: '',
    },
  });

  const selectedType = watch('requestType');
  const selectedPriority = watch('priority');

  React.useEffect(() => {
    fetchClientProjects()
      .then((data) => {
        setProjects(data);
        if (data.length === 1) {
          setValue('projectId', data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch projects:', err);
      })
      .finally(() => {
        setLoadingProjects(false);
      });
  }, [setValue]);

  const onSubmit = async (values: ChangeRequestFormValues) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const newRequest = await createChangeRequest(values);
      if (newRequest && newRequest.id) {
        router.push(`/portal/requests/${newRequest.id}`);
      } else {
        router.push('/portal/requests');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit request. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const requestTypeOptions: {
    type: RequestType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'CHANGE_REQUEST',
      label: 'Change Request',
      description: 'Scope adjustments, feature additions, or design modifications',
      icon: <Sparkles className="h-4 w-4 text-primary" />,
    },
    {
      type: 'BUG_ISSUE',
      label: 'Bug / Issue',
      description: 'Defect, unexpected behavior, or malfunction report',
      icon: <Bug className="h-4 w-4 text-rose-500" />,
    },
    {
      type: 'GENERAL_REQUEST',
      label: 'General Request',
      description: 'Content updates, asset deployment, or minor adjustments',
      icon: <FileEdit className="h-4 w-4 text-cyan-500" />,
    },
    {
      type: 'QUESTION',
      label: 'Question',
      description: 'Technical guidance, scope inquiry, or consultation',
      icon: <HelpCircle className="h-4 w-4 text-purple-500" />,
    },
    {
      type: 'OTHER',
      label: 'Other',
      description: 'Any miscellaneous inquiries or instructions',
      icon: <Layers className="h-4 w-4 text-slate-500" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Bar */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/portal" className="hover:text-foreground transition-colors">
          Portal
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/portal/requests" className="hover:text-foreground transition-colors">
          Requests
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">New Request</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-primary" /> Submit Project Request
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Specify required changes, report issues, or communicate needs directly to your dedicated team.
          </p>
        </div>

        <Link href="/portal/requests">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Requests
          </Button>
        </Link>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-medium">{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">1. Project & Request Category</CardTitle>
            <CardDescription className="text-xs">
              Select which project this request is related to and what type of ticket you are submitting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-xs">
            {/* Project Selection */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Associated Project *</span>
                {loadingProjects && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading projects...
                  </span>
                )}
              </label>
              <select
                {...register('projectId')}
                disabled={loadingProjects}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              >
                <option value="">-- Choose your project workspace --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.projectCode}] {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-destructive text-[11px] font-medium">{errors.projectId.message}</p>
              )}
            </div>

            {/* Request Type Selector */}
            <div className="space-y-2">
              <label className="font-semibold text-foreground">Request Type *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {requestTypeOptions.map((opt) => {
                  const isSelected = selectedType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setValue('requestType', opt.type, { shouldValidate: true })}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
                          : 'border-border bg-card/60 hover:border-border/80 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div className="flex items-center space-x-2">
                          {opt.icon}
                          <span className="font-bold text-xs text-foreground">{opt.label}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">2. Request Details & Description</CardTitle>
            <CardDescription className="text-xs">
              Provide comprehensive information to allow our engineering and design team to act promptly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Request Summary / Title *</label>
              <Input
                {...register('title')}
                placeholder="e.g. Integrate Stripe Webhooks, update hero typography, fix login redirection..."
                className="text-xs h-10"
              />
              {errors.title && (
                <p className="text-destructive text-[11px] font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Priority Level *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'LOW', label: 'Low', sub: 'Minor polish / backlog' },
                  { value: 'MEDIUM', label: 'Medium', sub: 'Standard revision' },
                  { value: 'HIGH', label: 'High', sub: 'Critical milestone item' },
                  { value: 'URGENT', label: 'Urgent', sub: 'Blocking production launch' },
                ].map((p) => {
                  const isSelected = selectedPriority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setValue('priority', p.value as any, { shouldValidate: true })}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/30'
                          : 'border-border bg-card/60 text-muted-foreground hover:bg-muted/30'
                      }`}
                    >
                      <p className="text-xs font-semibold text-foreground">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground">{p.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Detailed Description & Specifications *</label>
              <Textarea
                {...register('description')}
                rows={6}
                placeholder={`Describe your request clearly:\n- What needs to be changed or created?\n- What is the expected behavior or outcome?\n- Are there any specific brand guidelines, URLs, or references?`}
                className="text-xs resize-none leading-relaxed"
              />
              {errors.description && (
                <p className="text-destructive text-[11px] font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Optional Attachment Link */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Optional Attachment URL / Cloud Document Link</span>
              </label>
              <Input
                {...register('attachmentUrl')}
                placeholder="https://drive.google.com/..., https://figma.com/..., https://dropbox.com/..."
                className="text-xs h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Paste a link to Figma design files, Google Drive folders, Loom video recordings, or PDFs.
              </p>
              {errors.attachmentUrl && (
                <p className="text-destructive text-[11px] font-medium">{errors.attachmentUrl.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informational SLA Banner */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-3 text-xs text-muted-foreground">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Turnaround & Review Process</p>
            <p className="leading-relaxed">
              Once submitted, your dedicated project manager will review the request, evaluate required resources,
              and update the ticket status. You will be able to track timeline progression and converse in real-time.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link href="/portal/requests">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={submitting} className="gap-2 text-xs font-semibold shadow-xs">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Request
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
