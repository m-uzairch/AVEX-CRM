/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { CombinedProjectAnalyticsResponse, ReportFilterState } from '../../types/project-report-types';
import { ReportExporter } from '../../utils/report-exporter';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table, FileSpreadsheet, X, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData: CombinedProjectAnalyticsResponse;
  filters: ReportFilterState;
}

export function ReportExportModal({
  isOpen,
  onClose,
  analyticsData,
  filters,
}: ReportExportModalProps) {
  const toastCtx = useToast();
  const [exportFormat, setExportFormat] = React.useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');
  const [reportScope, setReportScope] = React.useState('EXECUTIVE_SUMMARY');
  const [isExporting, setIsExporting] = React.useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Record export log to backend
      await fetch('/api/projects/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: reportScope,
          exportFormat,
          title: `Project ${reportScope.replace(/_/g, ' ')} Report`,
          filters,
        }),
      });

      if (exportFormat === 'PDF') {
        ReportExporter.printPDF(analyticsData, reportScope, filters);
      } else if (exportFormat === 'EXCEL') {
        ReportExporter.downloadExcel(analyticsData, reportScope, filters);
      } else {
        ReportExporter.downloadCSV(analyticsData, reportScope, filters);
      }

      toastCtx.success('Report Export Complete', `Successfully exported ${reportScope} in ${exportFormat} format.`);

      onClose();
    } catch (err: any) {
      console.error('Export failed:', err);
      toastCtx.error('Export Failed', 'Unable to generate report export file.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Export Analytics Report</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Format selection */}
          <div>
            <label className="font-semibold text-foreground block mb-2">Select Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('PDF')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  exportFormat === 'PDF'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <FileText className="h-5 w-5 text-rose-500" />
                <span>PDF (Print)</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('EXCEL')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  exportFormat === 'EXCEL'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('CSV')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  exportFormat === 'CSV'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Table className="h-5 w-5 text-blue-500" />
                <span>CSV Data</span>
              </button>
            </div>
          </div>

          {/* Scope selection */}
          <div>
            <label className="font-semibold text-foreground block mb-1">Report Scope</label>
            <select
              value={reportScope}
              onChange={(e) => setReportScope(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground"
            >
              <option value="EXECUTIVE_SUMMARY">Executive Overview & Performance</option>
              <option value="PROJECT_PERFORMANCE">Project Performance Matrix</option>
              <option value="TEAM_ANALYTICS">Team Utilization & Workload</option>
              <option value="TASK_MILESTONE">Task & Milestone Breakdown</option>
              <option value="TIME_BUDGET">Time Tracking & Budget Variance</option>
            </select>
          </div>

          {/* Export metadata notice */}
          <div className="bg-muted/40 p-3 rounded-md border border-border/60 text-[11px] text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" />
              Included in Export File:
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Header & Filter State details</li>
              <li>Calculated KPI summary cards</li>
              <li>Full data table breakdown</li>
              <li>Export timestamp & audit signature</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>Export Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
