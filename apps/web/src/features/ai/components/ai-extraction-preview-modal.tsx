'use client';

import * as React from 'react';
import {
  DocumentExtractionPreviewItem,
  ExtractedDeadlineItem,
} from '../schemas/document-extraction-schema';
import { ExtractionPipelineResult } from '../services/ai-extraction-pipeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Calendar,
  Loader2,
  Check,
} from 'lucide-react';

interface AIExtractionPreviewModalProps {
  isOpen: boolean;
  pipelineResult: ExtractionPipelineResult | null;
  entityType: 'LEAD' | 'CUSTOMER';
  onClose: () => void;
  onImportCompleted: () => void;
}

export function AIExtractionPreviewModal({
  isOpen,
  pipelineResult,
  entityType,
  onClose,
  onImportCompleted,
}: AIExtractionPreviewModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [items, setItems] = React.useState<DocumentExtractionPreviewItem[]>([]);
  const [deadlines, setDeadlines] = React.useState<ExtractedDeadlineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (pipelineResult) {
      setItems(pipelineResult.previewItems || []);
      setDeadlines(pipelineResult.detectedDeadlines || []);
    }
  }, [pipelineResult]);

  if (!isOpen || !pipelineResult) return null;

  const handleUpdateItemField = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      data: {
        ...updated[index].data,
        [field]: value,
      },
    };
    setItems(updated);
  };

  const handleUpdateStrategy = (index: number, strategy: 'SKIP' | 'UPDATE' | 'CREATE_NEW') => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      duplicateStrategy: strategy,
    };
    setItems(updated);
  };

  const handleToggleDeadline = (index: number) => {
    const updated = [...deadlines];
    updated[index] = {
      ...updated[index],
      syncToCalendar: !updated[index].syncToCalendar,
    };
    setDeadlines(updated);
  };

  const handleConfirmImport = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ai/documents/confirm-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEntity: entityType,
          items,
          deadlinesToSync: deadlines.filter((d) => d.syncToCalendar),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to complete import.');
      }

      const data = await res.json();
      toastSuccess('Import Successful', data.message);
      onImportCompleted();
      onClose();
    } catch (err: any) {
      toastError('Import Failed', err.message || 'Could not complete batch import.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = items.filter((i) => i.isValid && !i.isDuplicate).length;
  const duplicateCount = items.filter((i) => i.isDuplicate).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                AI Data Extraction Preview — {pipelineResult.fileName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review extracted records, resolve duplicates, and sync detected deadlines to your Calendar.
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

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">Total Extracted</span>
              <p className="text-base font-bold text-foreground">{items.length}</p>
            </div>
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">New Records</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{validCount}</p>
            </div>
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">Duplicate Warnings</span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400">{duplicateCount}</p>
            </div>
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
              <span className="text-[10px] text-primary font-semibold uppercase">Calendar Deadlines</span>
              <p className="text-base font-bold text-primary">{deadlines.length}</p>
            </div>
          </div>

          {/* Detected Deadlines & Calendar Sync Banner */}
          {deadlines.length > 0 && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">
                    Detected Project Deadlines & Milestones ({deadlines.length})
                  </h4>
                </div>
                <Badge variant="outline" className="text-[10px] bg-background border-primary/30 text-primary">
                  Auto-Sync to Calendar
                </Badge>
              </div>

              <div className="space-y-2">
                {deadlines.map((dl, idx) => (
                  <div
                    key={dl.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-background/80 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={dl.syncToCalendar}
                        onChange={() => handleToggleDeadline(idx)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{dl.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {dl.date} • {dl.description}
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary" className="text-[10px]">
                      {dl.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Records Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Name / Contact</th>
                    <th className="py-3 px-3">Company</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Duplicate Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      {/* Name */}
                      <td className="py-2.5 px-3">
                        <Input
                          value={item.data.name || ''}
                          onChange={(e) => handleUpdateItemField(idx, 'name', e.target.value)}
                          className="h-7 text-xs font-semibold"
                        />
                      </td>

                      {/* Company */}
                      <td className="py-2.5 px-3">
                        <Input
                          value={item.data.companyName || ''}
                          onChange={(e) => handleUpdateItemField(idx, 'companyName', e.target.value)}
                          className="h-7 text-xs"
                        />
                      </td>

                      {/* Email */}
                      <td className="py-2.5 px-3">
                        <Input
                          value={item.data.email || ''}
                          onChange={(e) => handleUpdateItemField(idx, 'email', e.target.value)}
                          className="h-7 text-xs font-mono"
                        />
                      </td>

                      {/* Phone */}
                      <td className="py-2.5 px-3">
                        <Input
                          value={item.data.phone || ''}
                          onChange={(e) => handleUpdateItemField(idx, 'phone', e.target.value)}
                          className="h-7 text-xs font-mono"
                        />
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {item.isDuplicate ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                            <Copy className="h-3 w-3 mr-1" />
                            Duplicate
                          </Badge>
                        ) : item.isValid ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </td>

                      {/* Duplicate Strategy Dropdown */}
                      <td className="py-2.5 px-3">
                        {item.isDuplicate ? (
                          <select
                            value={item.duplicateStrategy}
                            onChange={(e) => handleUpdateStrategy(idx, e.target.value as any)}
                            className="h-7 bg-background border border-border rounded-md px-2 text-[11px] font-medium focus:outline-hidden"
                          >
                            <option value="SKIP">Skip Duplicate</option>
                            <option value="UPDATE">Update Existing</option>
                            <option value="CREATE_NEW">Create New</option>
                          </select>
                        ) : (
                          <span className="text-[11px] text-muted-foreground flex items-center">
                            <Check className="h-3 w-3 mr-1 text-emerald-500" />
                            Ready to import
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {deadlines.filter((d) => d.syncToCalendar).length} deadlines will be automatically synced to the Calendar.
          </p>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmImport} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>Confirm & Import to CRM</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
