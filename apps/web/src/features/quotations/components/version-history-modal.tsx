/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { QuotationVersion } from '../types/quotation-types';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: QuotationVersion[];
  quoteNumber: string;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  versions,
  quoteNumber,
}: VersionHistoryModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Version History - ${quoteNumber}`}
      description="Review historical revisions, change logs, and total value snapshots for this quotation estimate."
    >
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1 py-2 text-xs">
        {versions.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">No revision history available.</div>
        ) : (
          versions.map((ver) => (
            <div
              key={ver.id}
              className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-primary text-primary-foreground font-extrabold text-[10px]">
                    v{ver.versionNumber}
                  </Badge>
                  <span className="font-bold text-foreground text-xs">
                    ${Number(ver.snapshotData?.grandTotal || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-[11px] text-muted-foreground font-mono">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(ver.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {ver.changeNotes && (
                <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-background p-2 rounded-md border border-border/60">
                  <span className="font-semibold text-muted-foreground mr-1">Notes:</span>
                  {ver.changeNotes}
                </div>
              )}

              <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground pt-0.5">
                <User className="h-3 w-3" />
                <span>Modified by {ver.createdByName || 'System User'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Dialog>
  );
}
