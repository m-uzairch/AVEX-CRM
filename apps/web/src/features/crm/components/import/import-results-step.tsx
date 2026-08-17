'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatsCard } from '../stats-card';
import {
  CheckCircle2,
  Users,
  AlertTriangle,
  Download,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ImportJob } from '../../types/import-types';
import { downloadErrorReport } from '../../services/import-service';

interface ImportResultsStepProps {
  job: ImportJob;
  onReset: () => void;
}

export function ImportResultsStep({ job, onReset }: ImportResultsStepProps) {
  const handleDownloadReport = async (format: 'csv' | 'json') => {
    try {
      await downloadErrorReport(job.id, format);
    } catch {
      alert('Failed to download error report.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-xs animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl text-center space-y-2 shadow-lg">
        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-xl font-extrabold">Lead Import Completed Successfully</h2>
        <p className="text-xs text-white/80">
          Extracted records processed for file <strong>{job.fileName}</strong>.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          title="Total Parsed"
          value={job.totalRecords.toLocaleString()}
          change="Document rows"
          trend="up"
          icon={<FileSpreadsheet className="h-4 w-4 text-blue-500" />}
        />
        <StatsCard
          title="Imported"
          value={job.successCount.toLocaleString()}
          change="Added to leads"
          trend="up"
          icon={<Users className="h-4 w-4 text-emerald-500" />}
        />
        <StatsCard
          title="Duplicates"
          value={job.duplicateCount.toLocaleString()}
          change="Handled per rule"
          trend="up"
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        />
        <StatsCard
          title="Failed / Skipped"
          value={job.failedCount.toLocaleString()}
          change="Validation errors"
          trend="down"
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
        />
      </div>

      {/* Error Report Download Section */}
      {job.errorLog && job.errorLog.length > 0 && (
        <div className="bg-card border border-border p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-foreground">Import Error Report ({job.errorLog.length})</h4>
              <p className="text-[11px] text-muted-foreground">
                Download details of failed or skipped rows with suggested corrections.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => handleDownloadReport('csv')}
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV Report</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-border">
        <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5 text-xs">
          <PlusCircle className="h-4 w-4" />
          <span>Import Another File</span>
        </Button>

        <Link href="/crm/leads">
          <Button size="sm" className="gap-1.5 text-xs bg-primary">
            <span>View All Leads</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
