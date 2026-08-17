'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { ImportJob } from '../../types/import-types';
import { downloadErrorReport } from '../../services/import-service';

interface ImportHistoryTableProps {
  jobs: ImportJob[];
  isLoading?: boolean;
}

export function ImportHistoryTable({ jobs, isLoading = false }: ImportHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground text-xs">
        Loading import history...
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs space-y-2">
        <FileText className="h-8 w-8 mx-auto opacity-50 text-primary" />
        <p className="font-bold text-foreground">No import history found</p>
        <p className="text-[11px]">Upload a CSV, XLSX, PDF or image file to start your first AI lead import batch.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs text-xs">
      <table className="w-full text-left">
        <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
          <tr>
            <th className="p-3">File Name</th>
            <th className="p-3">Type / Size</th>
            <th className="p-3">Total Records</th>
            <th className="p-3">Imported</th>
            <th className="p-3">Duplicates</th>
            <th className="p-3">Failed</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
            <th className="p-3 text-right">Report</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-medium">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-muted/30 transition-colors">
              <td className="p-3 font-semibold text-foreground flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate max-w-[180px]">{job.fileName}</span>
              </td>
              <td className="p-3 text-muted-foreground font-mono text-[11px]">
                {job.fileType.toUpperCase()} ({(job.fileSize / 1024).toFixed(0)} KB)
              </td>
              <td className="p-3 font-bold text-foreground">{job.totalRecords}</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                {job.successCount}
              </td>
              <td className="p-3 text-amber-600">{job.duplicateCount}</td>
              <td className="p-3 text-red-500">{job.failedCount}</td>
              <td className="p-3">
                <Badge
                  variant={
                    job.status === 'COMPLETED'
                      ? 'default'
                      : job.status === 'FAILED'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className="text-[10px]"
                >
                  {job.status}
                </Badge>
              </td>
              <td className="p-3 text-muted-foreground text-[11px]">
                {new Date(job.createdAt).toLocaleString()}
              </td>
              <td className="p-3 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={() => downloadErrorReport(job.id, 'csv')}
                  title="Download Error Report"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
