'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import { DashboardFilterState, DashboardStats } from '../../types/dashboard-types';
import { CRMDashboardService } from '../../services/crm-dashboard-service';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DashboardFilterState;
  stats: DashboardStats;
}

export function ExportReportModal({
  isOpen,
  onClose,
  filters,
  stats,
}: ExportReportModalProps) {
  const [format, setFormat] = React.useState<'csv' | 'excel' | 'pdf'>('pdf');
  const [isExporting, setIsExporting] = React.useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await CRMDashboardService.exportReport(format, filters, stats);
      onClose();
    } catch {
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-popover border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Export CRM Dashboard Report</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground">
            Select your preferred file format to download executive KPI summaries, pipeline metrics, and sales analytics.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-xs font-semibold ${
                format === 'pdf'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80'
              }`}
            >
              <FileText className="h-6 w-6 text-red-500" />
              <span>PDF Document</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('excel')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-xs font-semibold ${
                format === 'excel'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80'
              }`}
            >
              <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-xs font-semibold ${
                format === 'csv'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80'
              }`}
            >
              <Download className="h-6 w-6 text-blue-500" />
              <span>CSV File</span>
            </button>
          </div>

          <div className="bg-muted/40 p-3 rounded-lg border border-border/60 text-[11px] text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Date Filter:</span>
              <strong className="text-foreground">{filters.dateRange}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Customers Included:</span>
              <strong className="text-foreground">{stats.totalCustomers}</strong>
            </div>
            <div className="flex justify-between">
              <span>Pipeline Value Included:</span>
              <strong className="text-foreground">${stats.totalPipelineValue.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleExport} disabled={isExporting} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Generating Report...' : `Export ${format.toUpperCase()}`}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
