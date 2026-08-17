/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ScheduledReportJob } from '../../types/project-report-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Mail, Clock, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface ScheduledReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduledReportsModal({ isOpen, onClose }: ScheduledReportsModalProps) {
  const toastCtx = useToast();
  const [schedules, setSchedules] = React.useState<ScheduledReportJob[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState('');
  const [reportType, setReportType] = React.useState('PROJECT_PERFORMANCE');
  const [frequency, setFrequency] = React.useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [recipient, setRecipient] = React.useState('');
  const [exportFormat, setExportFormat] = React.useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');

  const fetchSchedules = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects/reports/schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchSchedules();
    }
  }, [isOpen, fetchSchedules]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/projects/reports/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `${frequency} ${reportType.replace(/_/g, ' ')} Report`,
          reportType,
          frequency,
          recipients: [recipient],
          exportFormat,
        }),
      });

      if (res.ok) {
        toastCtx.success('Report Schedule Created', `Scheduled ${frequency.toLowerCase()} ${exportFormat} reports sent to ${recipient}`);
        setTitle('');
        setRecipient('');
        fetchSchedules();
      }
    } catch (err: any) {
      console.error('Failed to create schedule:', err);
      toastCtx.error('Creation Failed', 'Unable to save report schedule.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/reports/schedules?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toastCtx.info('Schedule Removed', 'Recurring report schedule has been cancelled.');
        fetchSchedules();
      }
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Scheduled Automated Reports</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {/* Create New Form */}
          <form onSubmit={handleCreate} className="bg-muted/30 p-3.5 rounded-lg border border-border space-y-3">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>Create New Report Schedule</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">Report Title</label>
                <Input
                  placeholder="e.g. Weekly Executive Summary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">Recipient Email</label>
                <Input
                  type="email"
                  required
                  placeholder="manager@company.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full h-8 px-2 text-xs bg-background border border-input rounded-md text-foreground"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">Report Scope</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-background border border-input rounded-md text-foreground"
                >
                  <option value="PROJECT_PERFORMANCE">Project Performance</option>
                  <option value="TEAM_ANALYTICS">Team Utilization</option>
                  <option value="TIME_BUDGET">Time & Budget</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full h-8 px-2 text-xs bg-background border border-input rounded-md text-foreground"
                >
                  <option value="PDF">PDF</option>
                  <option value="EXCEL">Excel (.xlsx)</option>
                  <option value="CSV">CSV</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isCreating}
              className="w-full h-8 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span>Save Schedule</span>
            </Button>
          </form>

          {/* Active Schedules List */}
          <div>
            <div className="font-bold text-foreground mb-2 flex items-center justify-between">
              <span>Active Scheduled Jobs</span>
              <span className="text-[10px] text-muted-foreground">{schedules.length} Scheduled</span>
            </div>

            {isLoading ? (
              <div className="text-center py-6 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                Loading schedules...
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed border-border">
                No active scheduled reports configured yet.
              </div>
            ) : (
              <div className="space-y-2">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-card border border-border rounded-lg flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        <span>{s.title}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-xs font-semibold">
                          {s.frequency}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {s.recipients.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          Format: {s.exportFormat}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(s.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
