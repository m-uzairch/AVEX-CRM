/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ProjectCompletionReport } from '../../types/project-completion-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Printer, X, Loader2 } from 'lucide-react';

interface FinalCompletionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function FinalCompletionReportModal({
  isOpen,
  onClose,
  projectId,
}: FinalCompletionReportModalProps) {
  const [report, setReport] = React.useState<ProjectCompletionReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchReport = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/completion/report`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to fetch completion report:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    if (isOpen && projectId) {
      fetchReport();
    }
  }, [isOpen, projectId, fetchReport]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!report) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Final Completion Report - ${report.project.projectCode}</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #1e293b; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #1e3a8a; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; }
            .card-title { font-size: 10px; color: #64748b; font-weight: bold; }
            .card-val { font-size: 16px; font-weight: bold; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">AVEX CRM - Final Project Completion & Handover Report</div>
            <div>${report.project.projectCode}: ${report.project.name} | Client: ${report.project.customerName}</div>
          </div>

          <div class="grid">
            <div class="card"><div class="card-title">Duration</div><div class="card-val">${report.project.durationDays} Days</div></div>
            <div class="card"><div class="card-title">Completed Tasks</div><div class="card-val">${report.summary.completedTasks} / ${report.summary.totalTasks}</div></div>
            <div class="card"><div class="card-title">Hours Logged</div><div class="card-val">${report.summary.totalHoursLogged} hrs</div></div>
            <div class="card"><div class="card-title">Client Status</div><div class="card-val">${report.summary.clientApprovalStatus}</div></div>
          </div>

          <h3>Team Member Contribution</h3>
          <table>
            <thead>
              <tr><th>Name</th><th>Role</th><th>Completed Tasks</th><th>Hours Worked</th></tr>
            </thead>
            <tbody>
              ${report.teamPerformance
                .map((t) => `<tr><td>${t.fullName}</td><td>${t.role}</td><td>${t.completedTasksCount}</td><td>${t.hoursWorked} hrs</td></tr>`)
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Final Project Completion & Delivery Report</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-md p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {isLoading || !report ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
              Compiling project report...
            </div>
          ) : (
            <>
              {/* Project Info Header Banner */}
              <div className="bg-muted/40 p-3.5 rounded-lg border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-xs">
                      {report.project.projectCode}
                    </span>
                    <span>{report.project.name}</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">
                    {report.summary.clientApprovalStatus}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground flex flex-wrap gap-4 pt-1">
                  <span>Client: {report.project.customerName}</span>
                  <span>Manager: {report.project.projectManagerName}</span>
                  <span>Duration: {report.project.durationDays} Days</span>
                </div>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="text-[10px] text-muted-foreground font-medium">Tasks Delivered</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {report.summary.completedTasks} / {report.summary.totalTasks}
                  </div>
                </div>

                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="text-[10px] text-muted-foreground font-medium">Milestones Completed</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {report.summary.completedMilestones} / {report.summary.totalMilestones}
                  </div>
                </div>

                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="text-[10px] text-muted-foreground font-medium">Total Hours Worked</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {report.summary.totalHoursLogged} hrs
                  </div>
                </div>

                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="text-[10px] text-muted-foreground font-medium">Budget Utilized</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    ${report.summary.budgetUsed.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Team Member Contribution Table */}
              <div>
                <div className="font-bold text-foreground mb-2">Team Member Contribution Breakdown:</div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2 px-3">Team Member</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Tasks Completed</th>
                      <th className="py-2 px-3">Hours Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {report.teamPerformance.map((t, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-2 px-3 font-semibold text-foreground">{t.fullName}</td>
                        <td className="py-2 px-3 text-muted-foreground">{t.role}</td>
                        <td className="py-2 px-3 font-medium text-emerald-600">{t.completedTasksCount} tasks</td>
                        <td className="py-2 px-3 font-medium">{t.hoursWorked} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Delivery Details */}
              {report.deliveryDetails && (
                <div className="bg-emerald-500/5 p-3.5 rounded-lg border border-emerald-500/20 space-y-1">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300">Delivery Confirmation</div>
                  <p className="text-[11px] text-muted-foreground">{report.deliveryDetails.deliveryNotes}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>

          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              <span>Print PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
