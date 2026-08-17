'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Message, Conversation } from '@/features/communication/types/communication-types';
import {
  fetchProjectConversation,
  fetchConversationMessages,
  sendMessage,
} from '@/features/communication/services/communication-service';
import { Send, Loader2, MessageSquare, Reply, CornerDownRight } from 'lucide-react';

interface ProjectChatTabProps {
  projectId: string;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ProjectChatTab({ projectId }: ProjectChatTabProps) {
  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<Message | null>(null);
  const [sending, setSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const loadConversation = React.useCallback(async () => {
    try {
      setLoading(true);
      let conv = await fetchProjectConversation(projectId);

      // Auto-create if not found
      if (!conv) {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, type: 'PROJECT_CHAT' }),
        });
        if (res.ok) {
          const data = await res.json();
          conv = data.conversation;
        }
      }

      if (conv) {
        setConversation(conv);
        const msgs = await fetchConversationMessages(conv.id);
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Failed to load project chat:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !conversation) return;

    try {
      setSending(true);
      const msg = await sendMessage(conversation.id, content, replyTo?.id);
      setMessages((prev) => [...prev, msg]);
      setContent('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Loading project chat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chat Header */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Project Chat</h2>
            <p className="text-[10px] text-muted-foreground">
              {messages.length} messages · Internal team discussion
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          Live
        </Badge>
      </div>

      {/* Chat Thread */}
      <Card className="shadow-xs">
        <CardContent className="p-0 flex flex-col" style={{ height: '480px' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-semibold">No messages yet</p>
                <p className="text-[11px] mt-1">Start the project conversation below.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === 'usr_001';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 group ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-[11px] font-bold text-primary">
                      {getInitials(msg.sender.fullName)}
                    </div>

                    <div className={`max-w-[70%] space-y-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Reply Context */}
                      {msg.replyTo && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-l-2 border-primary/40 pl-2 py-0.5 bg-muted/30 rounded-r">
                          <CornerDownRight className="h-3 w-3 shrink-0" />
                          <span className="font-bold">{msg.replyTo.sender.fullName}:</span>
                          <span className="truncate max-w-[200px]">{msg.replyTo.content}</span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted border border-border text-foreground rounded-bl-none'
                        }`}
                      >
                        {!isOwn && (
                          <span className="block text-[10px] font-bold mb-1 opacity-70">{msg.sender.fullName}</span>
                        )}
                        {msg.content}
                      </div>

                      {/* Meta */}
                      <div className={`flex items-center gap-2 text-[10px] text-muted-foreground ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span>{formatTime(msg.createdAt)}</span>
                        {msg.isEdited && <span className="italic">(edited)</span>}
                        <button
                          onClick={() => setReplyTo(msg)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-primary cursor-pointer"
                        >
                          <Reply className="h-3 w-3" /> Reply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Indicator */}
          {replyTo && (
            <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CornerDownRight className="h-3 w-3 text-primary" />
                <span>Replying to <span className="font-bold text-foreground">{replyTo.sender.fullName}</span>:</span>
                <span className="truncate max-w-[200px] text-foreground">{replyTo.content}</span>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-destructive font-bold cursor-pointer">×</button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-card/50">
            <form onSubmit={handleSend} className="flex space-x-2">
              <Textarea
                placeholder="Type your message..."
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-xs bg-background resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as unknown as React.FormEvent);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={sending || !content.trim()}
                className="self-end gap-1.5 px-4 font-bold"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-1.5 pl-1">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
