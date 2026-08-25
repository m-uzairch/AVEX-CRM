'use client';

import * as React from 'react';
import { ChatMessage } from '../schemas/ai-assistant-schemas';
import { AIChatMessage } from './ai-chat-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'assistant',
    content: `👋 Hello! I am your **AVEX CRM AI Assistant**.\n\nI can answer questions about your real pipeline, sales revenue, overdue invoices, high-value customers, delayed projects, and team attendance.\n\nHow can I assist you today?`,
    timestamp: new Date().toISOString(),
    suggestedFollowUps: [
      'What were our sales this month?',
      'Which invoices are overdue?',
      'How many leads do we have in our pipeline?',
      'Show team attendance status today',
    ],
  },
];

export function AIAssistantDrawer({ isOpen, onClose }: AIAssistantDrawerProps) {
  const { error: toastError } = useToast();
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: newHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get answer from AI Assistant');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (err: any) {
      toastError('AI Assistant Error', err.message || 'Error processing inquiry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-card border-l border-border w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AVEX Smart Assistant</h3>
              <p className="text-[11px] text-muted-foreground">Connected to live CRM workspace context</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-muted/20 border-b border-border flex items-center space-x-2 overflow-x-auto text-[11px]">
          <button
            type="button"
            onClick={() => handleSendMessage('What was our revenue this month?')}
            className="flex items-center space-x-1 whitespace-nowrap px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary/40 hover:text-primary transition-colors text-muted-foreground"
          >
            <DollarSign className="h-3 w-3 text-emerald-500" />
            <span>Revenue</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Which invoices are overdue?')}
            className="flex items-center space-x-1 whitespace-nowrap px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary/40 hover:text-primary transition-colors text-muted-foreground"
          >
            <TrendingUp className="h-3 w-3 text-amber-500" />
            <span>Overdue</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Which leads need attention?')}
            className="flex items-center space-x-1 whitespace-nowrap px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary/40 hover:text-primary transition-colors text-muted-foreground"
          >
            <Users className="h-3 w-3 text-primary" />
            <span>Leads</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Show team attendance today')}
            className="flex items-center space-x-1 whitespace-nowrap px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary/40 hover:text-primary transition-colors text-muted-foreground"
          >
            <Clock className="h-3 w-3 text-indigo-500" />
            <span>Attendance</span>
          </button>
        </div>

        {/* Conversation Message List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {messages.map((msg) => (
            <AIChatMessage
              key={msg.id}
              message={msg}
              onFollowUpClick={(query) => handleSendMessage(query)}
            />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground py-3 pl-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Analyzing live CRM data and generating answer...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-border bg-background flex items-center space-x-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about your leads, revenue, overdue bills..."
            className="h-10 text-xs flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 px-3"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
