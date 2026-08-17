'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ClientMessage, ClientProjectOverview } from '@/features/portal/types/portal-types';
import { fetchClientProjects, fetchClientMessages, sendClientMessage } from '@/features/portal/services/portal-service';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export default function ClientMessagesPage() {
  const [projects, setProjects] = React.useState<ClientProjectOverview[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
  const [messages, setMessages] = React.useState<ClientMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newContent, setNewContent] = React.useState('');
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    fetchClientProjects().then((projs) => {
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
      setLoading(false);
    });
  }, []);

  const loadMessages = React.useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      const msgs = await fetchClientMessages(selectedProjectId);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  }, [selectedProjectId]);

  React.useEffect(() => {
    if (selectedProjectId) {
      loadMessages();
    }
  }, [selectedProjectId, loadMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newContent.trim()) return;

    try {
      setSending(true);
      await sendClientMessage(selectedProjectId, newContent);
      setNewContent('');
      loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Messages</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Direct communication thread between your team and AVEX project leads.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading messages...</span>
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          No projects available for messaging.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Projects Selector Sidebar */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Project</label>
            <div className="space-y-1">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    selectedProjectId === p.id
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs font-bold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="font-mono text-[10px] block text-muted-foreground">{p.projectCode}</span>
                  <span className="truncate block">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Thread Column */}
          <div className="md:col-span-3 space-y-4">
            <Card className="flex flex-col h-[500px]">
              {/* Message Feed Area */}
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-xs text-muted-foreground">
                    No messages in this thread yet. Send a message to get in touch with your project manager.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isClient = msg.senderType === 'CLIENT';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                            isClient
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted border border-border text-foreground rounded-bl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 pb-1 border-b border-white/20">
                            <span className="font-bold">{msg.senderName || (isClient ? 'You' : 'Project Lead')}</span>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>

              {/* Message Input Box */}
              <div className="p-3 border-t border-border bg-muted/30">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message to project lead..."
                    rows={2}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="text-xs bg-background"
                  />
                  <Button type="submit" disabled={sending || !newContent.trim()} className="gap-1.5 self-end px-4 py-5 font-bold">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
