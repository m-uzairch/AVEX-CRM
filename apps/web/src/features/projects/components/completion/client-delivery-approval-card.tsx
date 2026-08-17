/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ProjectDeliveryRecord } from '../../types/project-completion-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, FileCheck, Send, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface ClientDeliveryApprovalCardProps {
  projectId: string;
  delivery: ProjectDeliveryRecord;
  onResponseSubmitted: () => void;
}

export function ClientDeliveryApprovalCard({
  projectId,
  delivery,
  onResponseSubmitted,
}: ClientDeliveryApprovalCardProps) {
  const toastCtx = useToast();
  const [mode, setMode] = React.useState<'VIEW' | 'APPROVE' | 'REJECT'>('VIEW');
  const [feedback, setFeedback] = React.useState('');
  const [changesNeeded, setChangesNeeded] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (status: 'APPROVED' | 'CHANGES_REQUESTED') => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/completion/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          feedback,
          changesNeeded,
        }),
      });

      if (res.ok) {
        if (status === 'APPROVED') {
          toastCtx.success('Delivery Approved', 'Thank you! You have approved the project delivery.');
        } else {
          toastCtx.info('Changes Requested', 'Change request submitted. Project manager notified.');
        }
        onResponseSubmitted();
      } else {
        toastCtx.error('Submission Error', 'Failed to record approval response.');
      }
    } catch (err) {
      console.error('Approval failed:', err);
      toastCtx.error('Submission Error', 'Failed to submit approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-2xs border-border bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <span>Project Delivery Review & Confirmation</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Delivered on {new Date(delivery.deliveryDate).toLocaleDateString()} by {delivery.deliveredByName || 'Project Manager'}
          </CardDescription>
        </div>
        <Badge
          className={`text-xs font-bold ${
            delivery.clientApprovalStatus === 'APPROVED'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : delivery.clientApprovalStatus === 'CHANGES_REQUESTED'
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          }`}
        >
          {delivery.clientApprovalStatus === 'APPROVED' && 'APPROVED & COMPLETED'}
          {delivery.clientApprovalStatus === 'CHANGES_REQUESTED' && 'CHANGES REQUESTED'}
          {delivery.clientApprovalStatus === 'PENDING' && 'PENDING REVIEW'}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Delivery Notes */}
        {delivery.deliveryNotes && (
          <div className="bg-muted/40 p-3 rounded-lg border border-border/60">
            <div className="font-semibold text-foreground mb-1">Delivery Notes from Manager:</div>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{delivery.deliveryNotes}</p>
          </div>
        )}

        {/* Deliverables Files */}
        {delivery.deliveryFiles && delivery.deliveryFiles.length > 0 && (
          <div>
            <div className="font-bold text-foreground mb-1.5">Delivered Files & Packages:</div>
            <div className="space-y-1.5">
              {delivery.deliveryFiles.map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 bg-card border border-border rounded-md flex items-center justify-between shadow-2xs"
                >
                  <div className="font-medium text-foreground">{f.name}</div>
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-xs flex items-center gap-1 font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download File
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approve Form */}
        {mode === 'APPROVE' && (
          <div className="bg-emerald-500/5 p-3.5 rounded-lg border border-emerald-500/20 space-y-3 animate-in fade-in duration-200">
            <div className="font-bold text-emerald-700 dark:text-emerald-300">Confirm Project Approval</div>
            <Textarea
              rows={2}
              placeholder="Add optional completion feedback or testimonial notes for the team..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="text-xs bg-background"
            />
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => handleSubmit('APPROVED')}
                disabled={isSubmitting}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Confirm Approval
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode('VIEW')} className="h-8 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Request Changes Form */}
        {mode === 'REJECT' && (
          <div className="bg-rose-500/5 p-3.5 rounded-lg border border-rose-500/20 space-y-3 animate-in fade-in duration-200">
            <div className="font-bold text-rose-700 dark:text-rose-300">Request Revisions or Changes</div>
            <Textarea
              rows={3}
              required
              placeholder="Describe the requested changes, bugs, or missing requirements in detail..."
              value={changesNeeded}
              onChange={(e) => setChangesNeeded(e.target.value)}
              className="text-xs bg-background"
            />
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => handleSubmit('CHANGES_REQUESTED')}
                disabled={isSubmitting || !changesNeeded}
                className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Submit Change Request
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode('VIEW')} className="h-8 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {delivery.clientApprovalStatus === 'PENDING' && mode === 'VIEW' && (
        <CardFooter className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode('REJECT')}
            className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Request Changes
          </Button>

          <Button
            size="sm"
            onClick={() => setMode('APPROVE')}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Approve Project Delivery
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
