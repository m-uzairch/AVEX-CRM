'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Eye, EyeOff, X, Save } from 'lucide-react';
import { WidgetPreferenceItem } from '../../types/dashboard-types';
import { CRMDashboardService } from '../../services/crm-dashboard-service';

interface WidgetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetPreferenceItem[];
  onSave: (updated: WidgetPreferenceItem[]) => void;
}

export function WidgetCustomizerModal({
  isOpen,
  onClose,
  widgets,
  onSave,
}: WidgetCustomizerModalProps) {
  const [localWidgets, setLocalWidgets] = React.useState<WidgetPreferenceItem[]>(widgets);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  if (!isOpen) return null;

  const handleToggleVisible = (id: string) => {
    setLocalWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w))
    );
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await CRMDashboardService.saveWidgetPreferences(localWidgets);
      onSave(localWidgets);
      onClose();
    } catch {
      alert('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-popover border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Customize Dashboard Widgets</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-muted-foreground">
          Show or hide specific analytical widgets to tailor your workspace layout.
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {localWidgets.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors"
            >
              <span className="font-semibold text-foreground">{w.title}</span>
              <button
                type="button"
                onClick={() => handleToggleVisible(w.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  w.isVisible
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
                title={w.isVisible ? 'Hide Widget' : 'Show Widget'}
              >
                {w.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSavePreferences} disabled={isSaving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
