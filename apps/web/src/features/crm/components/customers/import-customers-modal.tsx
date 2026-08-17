'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, FileSpreadsheet, Sparkles, Download } from 'lucide-react';

export interface ImportCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportCustomersModal({ isOpen, onClose }: ImportCustomersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Import Customers (CSV / Excel)</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-8 border-2 border-dashed border-border rounded-xl text-center space-y-3 bg-muted/20">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="font-semibold text-foreground">Drag and drop your CSV or Excel file here</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Supports .csv, .xlsx, .xls (Max 10MB)</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              Browse Files
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-start space-x-2 text-primary">
            <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>AI Import Assistance</strong> will be available in Task 006 for automatic column mapping and duplicate resolution!
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 text-muted-foreground">
            <span>Need a sample file template?</span>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
              <Download className="h-3.5 w-3.5 mr-1" /> Download CSV Template
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 px-6 py-3 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
