/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportType, ScheduleFrequency } from '../types/report-types';
import { Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface ReportScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
}

export function ReportScheduleDialog({ isOpen, onClose, reportType }: ReportScheduleDialogProps) {
  const toastCtx = useToast();
  const [title, setTitle] = React.useState(`${reportType} Monthly Summary Report`);
  const [frequency, setFrequency] = React.useState<ScheduleFrequency>('MONTHLY');
  const [emailRecipients, setEmailRecipients] = React.useState('billing@avexcrm.io, admin@avexcrm.io');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const recipients = emailRecipients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/reports/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          reportType,
          frequency,
          recipients,
        }),
      });

      if (res.ok) {
        toastCtx.success('Report Scheduled', `Automated ${frequency.toLowerCase()} report delivery enabled.`);
        onClose();
      }
    } catch {
      toastCtx.error('Error', 'Failed to schedule report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClassName = "flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
        <Calendar className="h-4 w-4 text-primary" />
        Schedule Automated Report
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Report Schedule Title *</label>
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            required
            className="h-8 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Recurrence Frequency *</label>
          <select
            value={frequency}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFrequency(e.target.value as ScheduleFrequency)}
            className={selectClassName}
          >
            <option value="DAILY">Daily Email Summary</option>
            <option value="WEEKLY">Weekly Summary (Every Monday)</option>
            <option value="MONTHLY">Monthly Financial Digest</option>
            <option value="QUARTERLY">Quarterly Board Digest</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Recipients (Comma separated emails)</label>
          <Input
            value={emailRecipients}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailRecipients(e.target.value)}
            placeholder="e.g. founder@company.com, cfo@company.com"
            required
            className="h-8 text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="h-8 text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs gap-1.5 bg-primary">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Enable Schedule'
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
