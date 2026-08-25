'use client';

import * as React from 'react';
import { ChatMessage } from '../schemas/ai-assistant-schemas';
import { cn } from '@/lib/utils';
import { Sparkles, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AIChatMessageProps {
  message: ChatMessage;
  onFollowUpClick?: (query: string) => void;
}

export function AIChatMessage({ message, onFollowUpClick }: AIChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex space-x-3 py-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
          <Sparkles className="h-4 w-4 animate-pulse" />
        </div>
      )}

      <div className={cn('space-y-2 max-w-[82%]', isUser && 'items-end')}>
        {/* Message Bubble */}
        <div
          className={cn(
            'p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none font-medium'
              : 'bg-card border border-border text-foreground rounded-tl-none prose prose-xs dark:prose-invert max-w-none'
          )}
        >
          {/* Format multiline markdown text */}
          <div className="whitespace-pre-wrap font-sans text-xs">
            {message.content}
          </div>
        </div>

        {/* References / Deep links */}
        {!isUser && message.references && message.references.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.references.map((ref, idx) => (
              <Link
                key={idx}
                href={ref.url}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold transition-colors"
              >
                <span>{ref.title}</span>
                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
              </Link>
            ))}
          </div>
        )}

        {/* Suggested Follow-up Pills */}
        {!isUser && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Suggested Follow-ups:
            </span>
            <div className="flex flex-col space-y-1">
              {message.suggestedFollowUps.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFollowUpClick?.(q)}
                  className="text-left text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-primary/20"
                >
                  → {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 border border-border">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
