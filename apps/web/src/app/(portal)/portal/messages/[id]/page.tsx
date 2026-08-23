'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClientConversation, ClientMessage } from '@/features/portal/types/portal-types';
import {
  fetchClientConversationById,
  replyClientConversation,
} from '@/features/portal/services/portal-service';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
  FolderKanban,
  ExternalLink,
  Paperclip,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function ClientConversationDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [conversation, setConversation] = React.useState<ClientConversation | null>(null);
  const [messages, setMessages] = React.useState<ClientMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [replyText, setReplyText] = React.useState('');
  const [attachmentUrl, setAttachmentUrl] = React.useState('');
  const [showAttachmentInput, setShowAttachmentInput] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const loadConversation = React.useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClientConversationById(conversationId);
      setConversation(data);
      setMessages(data.messages || []);
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
      setError(err?.message || 'Failed to load conversation.');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  React.useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;

    try {
      setSending(true);
      const newMsg = await replyClientConversation(
        conversationId,
        replyText.trim(),
        attachmentUrl.trim() || null
      );
      setMessages((prev) => [...prev, newMsg]);
      setReplyText('');
      setAttachmentUrl('');
      setShowAttachmentInput(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="font-medium">Connecting to project channel...</span>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 font-sans">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Channel Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error || 'This conversation channel does not exist or you do not have permission to view it.'}
        </p>
        <div className="pt-2">
          <Link href="/portal/messages">
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Channels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Link href="/portal" className="hover:text-foreground transition-colors">
            Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/portal/messages" className="hover:text-foreground transition-colors">
            Messages
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-md">
            {conversation.project?.name || conversation.subject}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/portal/messages">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Channels
            </Button>
          </Link>

          {conversation.project && (
            <Link href={`/portal/projects/${conversation.project.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <FolderKanban className="h-3.5 w-3.5 text-primary" /> View Workspace
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Messaging Window */}
      <Card className="h-[680px] flex flex-col justify-between shadow-xs border-border bg-card">
        {/* Top Channel Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-sm sm:text-base text-foreground">
                  {conversation.project?.name || conversation.subject}
                </h1>
                {conversation.project && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {conversation.project.projectCode}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dedicated client collaboration channel with the engineering and management team.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Encrypted Thread</span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-muted/10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-xs text-muted-foreground space-y-2">
              <div className="p-3 rounded-full bg-muted/60 text-muted-foreground/80">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-foreground">Channel is Ready</p>
              <p className="max-w-xs text-muted-foreground">
                Type a message below to start a conversation with your project team.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isClient = m.senderType === 'CLIENT';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isClient ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center space-x-2 text-[11px] text-muted-foreground px-1">
                    <span className="font-semibold text-foreground">
                      {isClient ? 'You (Client)' : m.senderName || 'Project Lead'}
                    </span>
                    {!isClient && (
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                        Team
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                      isClient
                        ? 'bg-primary text-primary-foreground rounded-br-xs font-medium shadow-2xs'
                        : 'bg-card border border-border text-foreground rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {m.attachmentUrl && (
                      <div className="mt-2.5 pt-2 border-t border-white/20 dark:border-border/60">
                        <a
                          href={m.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-lg text-[11px] font-semibold transition-colors ${
                            isClient
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : 'bg-muted/80 hover:bg-muted text-foreground'
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate flex-1">View / Download Attachment</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        <div className="p-3 sm:p-4 border-t border-border bg-card space-y-2">
          {showAttachmentInput && (
            <div className="flex items-center gap-2 pb-2">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                placeholder="Paste attachment URL (e.g. Google Drive, CDN link)..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="text-xs h-8"
              />
              <button
                type="button"
                onClick={() => {
                  setAttachmentUrl('');
                  setShowAttachmentInput(false);
                }}
                className="text-muted-foreground hover:text-foreground text-xs px-1"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSendReply} className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowAttachmentInput(!showAttachmentInput)}
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
              title="Attach link"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your message to the team... (Shift+Enter for newline)"
              className="text-xs min-h-[44px] max-h-28 resize-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply(e);
                }
              }}
            />

            <Button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="h-10 px-4 text-xs font-semibold gap-1.5 shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
