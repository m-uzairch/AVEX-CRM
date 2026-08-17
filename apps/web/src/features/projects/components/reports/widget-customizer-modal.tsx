/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ReportWidgetConfig } from '../../types/project-report-types';
import { Button } from '@/components/ui/button';
import { Settings, Eye, EyeOff, X, ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface WidgetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: ReportWidgetConfig[];
  onSave: (updated: ReportWidgetConfig[]) => void;
}

export function WidgetCustomizerModal({
  isOpen,
  onClose,
  widgets,
  onSave,
}: WidgetCustomizerModalProps) {
  const toastCtx = useToast();
  const [localWidgets, setLocalWidgets] = React.useState<ReportWidgetConfig[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (widgets && widgets.length > 0) {
      setLocalWidgets([...widgets].sort((a, b) => a.order - b.order));
    }
  }, [widgets]);

  if (!isOpen) return null;

  const toggleVisibility = (id: string) => {
    setLocalWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w))
    );
  };

  const moveOrder = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localWidgets.length) return;

    const copy = [...localWidgets];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Recalculate order numbers
    const updated = copy.map((w, idx) => ({ ...w, order: idx + 1 }));
    setLocalWidgets(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/projects/reports/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: localWidgets }),
      });

      onSave(localWidgets);
      toastCtx.success('Widget Preferences Saved', 'Dashboard layout and widget visibility updated.');
      onClose();
    } catch (err) {
      console.error('Failed to save widget preferences:', err);
      toastCtx.error('Save Failed', 'Unable to save widget preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Customize Dashboard Widgets</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-2 text-xs max-h-[60vh] overflow-y-auto">
          <p className="text-muted-foreground text-[11px] mb-3">
            Toggle visibility or reorder report components to customize your default analytics dashboard.
          </p>

          {localWidgets.map((w, index) => (
            <div
              key={w.id}
              className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                w.isVisible
                  ? 'bg-card border-border shadow-2xs'
                  : 'bg-muted/30 border-border/60 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => toggleVisibility(w.id)}
                  className={`p-1.5 rounded-md transition-colors ${
                    w.isVisible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {w.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <div>
                  <div className="font-bold text-foreground">{w.title}</div>
                  <div className="text-[10px] text-muted-foreground">{w.category}</div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveOrder(index, 'UP')}
                  className="h-7 w-7 p-0"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === localWidgets.length - 1}
                  onClick={() => moveOrder(index, 'DOWN')}
                  className="h-7 w-7 p-0"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
