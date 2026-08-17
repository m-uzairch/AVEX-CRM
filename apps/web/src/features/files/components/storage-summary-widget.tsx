'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StorageSummary } from '../types/file-types';
import { HardDrive, FileText, Folder } from 'lucide-react';

interface StorageSummaryWidgetProps {
  summary: StorageSummary;
}

export function StorageSummaryWidget({ summary }: StorageSummaryWidgetProps) {
  const maxStorageBytes = 100 * 1024 * 1024; // 100 MB quota threshold for UI gauge
  const usagePercentage = Math.min(Math.round((summary.totalBytesUsed / maxStorageBytes) * 100), 100);

  return (
    <Card className="bg-gradient-to-r from-card via-card to-primary/5 border-border shadow-xs mb-4">
      <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Storage Bar */}
        <div className="flex-1 space-y-1.5 max-w-md">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-foreground font-bold">
              <HardDrive className="h-4 w-4 text-primary" /> Storage Used
            </span>
            <span className="font-mono text-primary font-bold">{summary.formattedStorageUsed} / 100 MB</span>
          </div>

          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* File & Folder Counters */}
        <div className="flex items-center space-x-4 text-xs shrink-0">
          <div className="flex items-center space-x-1.5">
            <Folder className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">Folders:</span>
            <span className="font-bold font-mono text-foreground">{summary.totalFoldersCount}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <FileText className="h-4 w-4 text-indigo-500" />
            <span className="text-muted-foreground">Files:</span>
            <span className="font-bold font-mono text-foreground">{summary.totalFilesCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
