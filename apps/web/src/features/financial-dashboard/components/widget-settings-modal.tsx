/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { WidgetPreferences } from '../types/financial-dashboard-types';
import { useToast } from '@/providers/toast-provider';

interface WidgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: WidgetPreferences;
  onSaved: (newPrefs: WidgetPreferences) => void;
}

const AVAILABLE_WIDGETS = [
  { id: 'REVENUE_TREND', label: 'Monthly Revenue vs Expense Performance', desc: 'Bar chart comparing monthly collections & spending' },
  { id: 'EXPENSE_BREAKDOWN', label: 'Expense Category Breakdown', desc: 'Category spending distribution' },
  { id: 'INVOICE_ANALYTICS', label: 'Invoice Status Analytics', desc: 'Distribution of paid, open, overdue, and draft invoices' },
  { id: 'PROJECT_PROFITABILITY', label: 'Project Profitability Summary', desc: 'Project budgets, expenses, revenue, and profit margins' },
  { id: 'TOP_CUSTOMERS', label: 'Top Revenue Client Accounts', desc: 'Highest value client accounts by lifetime revenue' },
  { id: 'RECENT_ACTIVITIES', label: 'Recent Financial Audit Feed', desc: 'Real-time timeline log of payments, invoices, and expenses' },
];

export function WidgetSettingsModal({
  isOpen,
  onClose,
  preferences,
  onSaved,
}: WidgetSettingsModalProps) {
  const toastCtx = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedWidgets, setSelectedWidgets] = React.useState<string[]>(
    preferences.visibleWidgets || AVAILABLE_WIDGETS.map((w) => w.id)
  );

  const toggleWidget = (id: string) => {
    if (selectedWidgets.includes(id)) {
      if (selectedWidgets.length === 1) {
        toastCtx.error('Layout Error', 'At least one widget must remain visible.');
        return;
      }
      setSelectedWidgets(selectedWidgets.filter((w) => w !== id));
    } else {
      setSelectedWidgets([...selectedWidgets, id]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload: WidgetPreferences = {
        visibleWidgets: selectedWidgets,
        widgetOrder: selectedWidgets,
        defaultDateRange: preferences.defaultDateRange || 'THIS_YEAR',
      };

      const res = await fetch('/api/financial-dashboard/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toastCtx.success('Layout Saved', 'Dashboard widget preferences updated.');
        onSaved(payload);
        onClose();
      } else {
        toastCtx.error('Save Error', 'Failed to save layout preferences.');
      }
    } catch (err) {
      console.error('Save preferences error:', err);
      toastCtx.error('Error', 'Failed to update settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Financial Dashboard Layout"
      description="Toggle widget visibility and configure your personal financial overview."
    >
      <div className="space-y-3 py-2 text-xs">
        {AVAILABLE_WIDGETS.map((w) => {
          const isChecked = selectedWidgets.includes(w.id);
          return (
            <div
              key={w.id}
              onClick={() => toggleWidget(w.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                isChecked
                  ? 'border-primary bg-primary/5 text-foreground font-semibold'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-foreground">{w.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{w.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
            </div>
          );
        })}

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8.5 text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
