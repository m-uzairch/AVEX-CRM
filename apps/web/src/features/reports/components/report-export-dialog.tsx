/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReportType } from '../types/report-types';
import { Download, Printer, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface ReportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  data: any;
}

export function ReportExportDialog({ isOpen, onClose, reportType, data }: ReportExportDialogProps) {
  const toastCtx = useToast();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, format: 'CSV', data }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `avex_${reportType.toLowerCase()}_report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toastCtx.success('Export Successful', 'Report downloaded in CSV format.');
        onClose();
      }
    } catch {
      toastCtx.error('Export Error', 'Failed to export CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
        <Download className="h-4 w-4 text-primary" />
        Export & Print Report
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Choose your preferred format to export or print the current <strong>{reportType}</strong> report.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={isExporting}
          className="h-20 flex flex-col items-center justify-center gap-2 border-border hover:border-primary/50 text-xs"
        >
          {isExporting ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          )}
          <span>Download CSV</span>
        </Button>

        <Button
          variant="outline"
          onClick={handlePrint}
          className="h-20 flex flex-col items-center justify-center gap-2 border-border hover:border-primary/50 text-xs"
        >
          <Printer className="h-5 w-5 text-primary" />
          <span>Print / PDF View</span>
        </Button>
      </div>

      <div className="flex justify-end pt-2 border-t border-border/40">
        <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
          Close
        </Button>
      </div>
    </Dialog>
  );
}
