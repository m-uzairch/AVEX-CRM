'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ClientConversation, ClientProjectOverview } from '@/features/portal/types/portal-types';
import {
  createConversationFormSchema,
  CreateConversationFormValues,
} from '@/features/portal/schemas/portal-schemas';
import {
  fetchClientConversations,
  createClientConversation,
  fetchClientProjects,
} from '@/features/portal/services/portal-service';
import {
  MessageSquare,
  Plus,
  Loader2,
  Search,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
  Paperclip,
} from 'lucide-react';

export default function ClientMessagesListPage() {
  const [conversations, setConversations] = React.useState<ClientConversation[]>([]);
  const [projects, setProjects] = React.useState<ClientProjectOverview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [convs, projs] = await Promise.all([
        fetchClientConversations({ search: searchQuery }),
        fetchClientProjects(),
      ]);
      setConversations(convs);
      setProjects(projs);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateConversationFormValues>({
    resolver: zodResolver(createConversationFormSchema),
    defaultValues: {
      projectId: '',
      subject: '',
      message: '',
      attachmentUrl: '',
    },
  });

  const onSubmit = async (values: CreateConversationFormValues) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      await createClientConversation(values);
      setIsModalOpen(false);
      reset();
      await loadData();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to start conversation.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalChannels = conversations.length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Communication</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Direct, real-time messaging channels with your dedicated project management and technical team.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" /> Start Conversation
          </Button>
        </div>
      </div>

      {/* KPI & Search Strip */}
      <Card className="p-3 bg-card border-border">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs text-muted-foreground pl-1">
            <span className="font-semibold text-foreground">
              {totalChannels} Channel{totalChannels === 1 ? '' : 's'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" /> Encrypted & Private
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Conversations Channels Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="font-medium">Loading project conversation channels...</span>
        </div>
      ) : conversations.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground border-dashed">
          <MessageSquare className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground">No Conversation Channels Found</p>
          <p className="mt-1 mb-5 max-w-sm mx-auto text-xs text-muted-foreground">
            {searchQuery
              ? 'No messaging channels match your search query.'
              : 'You currently do not have any active project communication channels.'}
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-2 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" /> Start New Discussion
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversations.map((c) => (
            <Link key={c.id} href={`/portal/messages/${c.id}`} className="block group">
              <Card className="hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs group-hover:bg-muted/15 flex flex-col justify-between h-full bg-card">
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    {c.project && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                        {c.project.projectCode}
                      </span>
                    )}
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                      Active Channel
                    </Badge>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {c.project?.name || c.subject}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                      {c.lastMessage || 'Channel created. Click to begin conversation.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>

                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                      Open Chat <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* START CONVERSATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Start a Conversation
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Project Workspace *</label>
                <select
                  {...register('projectId')}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Choose your project --</option>
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

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Subject / Topic *</label>
                <Input
                  {...register('subject')}
                  placeholder="e.g. Design Approval, API Integration Discussion..."
                  className="text-xs"
                />
                {errors.subject && (
                  <p className="text-destructive text-[11px] font-medium">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Message Body *</label>
                <Textarea
                  {...register('message')}
                  rows={4}
                  placeholder="Type your message to the engineering and management team..."
                  className="text-xs resize-none leading-relaxed"
                />
                {errors.message && (
                  <p className="text-destructive text-[11px] font-medium">{errors.message.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Optional Attachment URL</span>
                </label>
                <Input
                  {...register('attachmentUrl')}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="font-semibold gap-1.5">
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Starting...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
