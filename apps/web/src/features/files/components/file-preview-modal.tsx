'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProjectFile } from '../types/file-types';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

interface FilePreviewModalProps {
  file: ProjectFile | null;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  if (!file) return null;

  const isImage = file.fileType.startsWith('image/') || /\.(png|jpg|jpeg|webp|svg)$/i.test(file.name);
  const isPdf = file.fileType === 'application/pdf' || /\.pdf$/i.test(file.name);
  const isText = file.fileType.startsWith('text/') || /\.(txt|md|csv|json|xml|sql)$/i.test(file.name);

  const handleDownload = () => {
    // Simulated download action
    alert(`Downloading file "${file.name}"...`);
  };

  return (
    <Dialog
      isOpen={!!file}
      onClose={onClose}
      title={file.name}
      description={`Category: ${file.category} • Size: ${(file.fileSize / 1024).toFixed(1)} KB • Version ${file.currentVersion}`}
      className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4 py-2">
        {/* Preview Viewport Container */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 min-h-[350px] flex items-center justify-center overflow-hidden">
          {isImage ? (
            <div className="space-y-2 text-center">
              <div className="max-h-[400px] max-w-full rounded-lg overflow-hidden border border-border shadow-xs inline-block">
                <div className="p-8 bg-card flex flex-col items-center justify-center space-y-2">
                  <ImageIcon className="h-16 w-16 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{file.name}</span>
                </div>
              </div>
            </div>
          ) : isPdf ? (
            <div className="text-center space-y-3 py-12">
              <FileText className="h-16 w-16 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-foreground">PDF Document Preview Ready</p>
              <p className="text-[11px] text-muted-foreground">{file.originalName}</p>
            </div>
          ) : isText ? (
            <div className="w-full text-left font-mono text-xs p-4 rounded-lg bg-card border border-border overflow-x-auto space-y-1">
              <p className="text-muted-foreground italic">// Document Preview Content</p>
              <p className="text-foreground"># {file.name}</p>
              <p className="text-muted-foreground">Project deliverable document contents generated for {file.category}.</p>
            </div>
          ) : (
            <div className="text-center space-y-3 py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-xs font-bold text-foreground">Binary File Format</p>
              <p className="text-[11px] text-muted-foreground">Direct in-browser preview is unavailable for this file format. Click Download below.</p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-muted-foreground font-mono">
            {file.isClientVisible ? 'Shared with Client' : 'Internal Team Only'}
          </span>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-1.5 text-xs font-bold">
              <Download className="h-4 w-4" /> Download File
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
