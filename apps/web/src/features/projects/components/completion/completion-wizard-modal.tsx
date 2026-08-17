/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ProjectCompletionValidation } from '../../types/project-completion-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  X,
  FileCheck,
  Loader2,
  Upload,
} from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface CompletionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectCode: string;
  projectName: string;
  onDeliveryComplete: () => void;
}

export function CompletionWizardModal({
  isOpen,
  onClose,
  projectId,
  projectCode,
  projectName,
  onDeliveryComplete,
}: CompletionWizardModalProps) {
  const toastCtx = useToast();
  const [step, setStep] = React.useState<'VALIDATE' | 'DELIVER'>('VALIDATE');
  const [validation, setValidation] = React.useState<ProjectCompletionValidation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [deliveryNotes, setDeliveryNotes] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [fileUrl, setFileUrl] = React.useState('');
  const [deliveryFiles, setDeliveryFiles] = React.useState<any[]>([]);

  const fetchValidation = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/completion/validate`);
      if (res.ok) {
        const data = await res.json();
        setValidation(data);
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    if (isOpen) {
      setStep('VALIDATE');
      fetchValidation();
    }
  }, [isOpen, fetchValidation]);

  if (!isOpen) return null;

  const handleAddFile = () => {
    if (!fileName || !fileUrl) return;
    setDeliveryFiles((prev) => [
      ...prev,
      {
        id: `file_${Date.now()}`,
        name: fileName,
        fileUrl,
        fileSize: 1024 * 450,
        fileType: 'document',
      },
    ]);
    setFileName('');
    setFileUrl('');
  };

  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/completion/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveredById: 'usr_001',
          deliveryNotes,
          deliveryFiles,
        }),
      });

      if (res.ok) {
        toastCtx.success('Project Delivered', `Project ${projectCode} has been delivered for client review.`);
        onDeliveryComplete();
        onClose();
      } else {
        const errData = await res.json();
        toastCtx.error('Delivery Failed', errData.error || 'Unable to submit delivery.');
      }
    } catch (err: any) {
      console.error('Delivery submission failed:', err);
      toastCtx.error('Delivery Error', 'Failed to complete project delivery workflow.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold text-sm text-foreground">Project Completion & Delivery Wizard</h3>
              <p className="text-[11px] text-muted-foreground font-mono">
                {projectCode} - {projectName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-md p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wizard Steps Navigation */}
        <div className="flex items-center border-b border-border bg-muted/30 px-4 py-2 text-xs gap-4 font-semibold">
          <div className={`flex items-center gap-1.5 ${step === 'VALIDATE' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">1</span>
            <span>Completion Validation</span>
          </div>
          <div className="text-muted-foreground">/</div>
          <div className={`flex items-center gap-1.5 ${step === 'DELIVER' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">2</span>
            <span>Deliverables & Delivery Notes</span>
          </div>
        </div>

        {/* Step 1: Validation Rules */}
        {step === 'VALIDATE' && (
          <div className="p-4 space-y-4 text-xs max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Validating project requirements...
              </div>
            ) : validation ? (
              <>
                {/* Validation Status Banner */}
                <div
                  className={`p-3.5 rounded-lg border flex items-center justify-between ${
                    validation.isValid
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {validation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {validation.isValid
                          ? 'All Completion Criteria Passed!'
                          : 'Completion Criteria Attention Required'}
                      </div>
                      <div className="text-[11px] opacity-90">
                        Passed {validation.passedRulesCount} of {validation.totalRulesCount} mandatory checks.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation Rules Checklist */}
                <div className="space-y-2">
                  <div className="font-bold text-foreground mb-1">Validation Requirements Checklist:</div>
                  {validation.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-3 rounded-lg border flex items-start justify-between ${
                        rule.isPassed ? 'bg-card border-border' : 'bg-rose-500/5 border-rose-500/20'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        {rule.isPassed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-foreground">{rule.label}</div>
                          <div className="text-[11px] text-muted-foreground">{rule.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Step 2: Deliver Form */}
        {step === 'DELIVER' && (
          <form onSubmit={handleDeliverSubmit} className="p-4 space-y-4 text-xs max-h-[60vh] overflow-y-auto">
            <div>
              <label className="font-bold text-foreground block mb-1">Final Delivery Notes / Summary</label>
              <Textarea
                rows={3}
                required
                placeholder="Describe project deliverables, handoff documentation, login credentials, or final instructions for the client..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="text-xs bg-background"
              />
            </div>

            {/* Attach Deliverables */}
            <div className="space-y-2">
              <label className="font-bold text-foreground block">Attach Final Deliverables / Files</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="File Name (e.g. Final Deliverable Package.zip)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Download URL (https://...)"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFile}
                className="h-7 text-[11px] gap-1"
              >
                <Upload className="h-3 w-3" />
                <span>Add Deliverable File</span>
              </Button>

              {deliveryFiles.length > 0 && (
                <div className="space-y-1 pt-1">
                  {deliveryFiles.map((f) => (
                    <div key={f.id} className="p-2 bg-muted/40 rounded-md border border-border flex items-center justify-between text-[11px]">
                      <span className="font-medium truncate max-w-[300px]">{f.name}</span>
                      <span className="text-muted-foreground">{f.fileUrl}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>

          {step === 'VALIDATE' ? (
            <Button
              size="sm"
              onClick={() => setStep('DELIVER')}
              disabled={!validation?.isValid && !validation?.canOverride}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>Proceed to Delivery Notes</span>
              <Send className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('VALIDATE')} className="h-8 text-xs">
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleDeliverSubmit}
                disabled={isSubmitting}
                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Deliver Project Now</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
