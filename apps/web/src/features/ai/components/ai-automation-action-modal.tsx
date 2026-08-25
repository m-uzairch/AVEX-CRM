'use client';

import * as React from 'react';
import { AIAutomationItem } from '../schemas/ai-automation-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/providers/toast-provider';
import {
  X,
  Sparkles,
  Send,
  Calendar,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface AIAutomationActionModalProps {
  item: AIAutomationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onExecuted: () => void;
}

export function AIAutomationActionModal({
  item,
  isOpen,
  onClose,
  onExecuted,
}: AIAutomationActionModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [calendarDate, setCalendarDate] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (item) {
      setSubject(item.preparedPayload.subject || item.title);
      setBody(item.preparedPayload.emailBody || item.description);
      setCalendarDate(
        item.preparedPayload.calendarDate ||
          new Date(Date.now() + 86400000).toISOString().split('T')[0]
      );
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleExecute = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/ai/automations/${item.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customSubject: subject,
          customBody: body,
          calendarDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to execute automation.');
      }

      const data = await res.json();
      toastSuccess('Automation Executed', data.message);
      onExecuted();
      onClose();
    } catch (err: any) {
      toastError('Execution Failed', err.message || 'Error running automation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Review & Confirm AI Automation</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review and customize the AI-prepared draft before dispatching.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] uppercase font-bold">
                {item.triggerType}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {item.actionType}
              </Badge>
            </div>
            <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>

          {/* Recipient info if available */}
          {item.preparedPayload.recipientName && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Recipient: </span>
              <span>{item.preparedPayload.recipientName} ({item.preparedPayload.recipientEmail || 'Primary Contact'})</span>
            </div>
          )}

          {/* Email Subject / Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Subject / Action Title
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* Content / Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Message Content / Notes
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Calendar Scheduling Date */}
          {item.preparedPayload.calendarDate && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-primary mr-1" />
                <span>Schedule Calendar Follow-up Date</span>
              </label>
              <Input
                type="date"
                value={calendarDate}
                onChange={(e) => setCalendarDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-[11px] text-muted-foreground flex items-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-1" />
            Controlled execution — dispatches notification & logs audit trail
          </p>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleExecute} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>Approve & Execute</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
