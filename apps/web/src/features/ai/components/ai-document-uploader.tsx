'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExtractionPipelineResult } from '../services/ai-extraction-pipeline';
import { useToast } from '@/providers/toast-provider';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface AIDocumentUploaderProps {
  onExtractionComplete: (result: ExtractionPipelineResult, entityType: 'LEAD' | 'CUSTOMER') => void;
}

export function AIDocumentUploader({ onExtractionComplete }: AIDocumentUploaderProps) {
  const { error: toastError, success: toastSuccess } = useToast();
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedEntity, setSelectedEntity] = React.useState<'LEAD' | 'CUSTOMER'>('LEAD');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progressStatus, setProgressStatus] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['csv', 'pdf', 'txt', 'json'].includes(ext)) {
      toastError('Unsupported File Format', 'Please upload a CSV, PDF, or text document.');
      return;
    }

    setIsProcessing(true);
    setProgressStatus('Reading document bytes & extracting text streams...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetEntity', selectedEntity);

      setTimeout(() => {
        setProgressStatus('AI analyzing content, detecting deadlines, and structuring entities...');
      }, 700);

      const res = await fetch('/api/ai/documents/extract', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to extract data from document.');
      }

      const result: ExtractionPipelineResult = await res.json();
      toastSuccess('AI Extraction Complete', `Successfully extracted ${result.totalRecords} records.`);
      onExtractionComplete(result, selectedEntity);
    } catch (err: any) {
      toastError('Extraction Failed', err.message || 'An error occurred during AI extraction.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-border bg-card shadow-xs overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">AI Document & Data Extractor</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload CSV or PDF documents to automatically extract structured CRM entities and sync project deadlines to your Calendar.
            </p>
          </div>

          {/* Entity Type Toggle */}
          <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setSelectedEntity('LEAD')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all',
                selectedEntity === 'LEAD'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Sales Leads
            </button>
            <button
              type="button"
              onClick={() => setSelectedEntity('CUSTOMER')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all',
                selectedEntity === 'CUSTOMER'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Company Customers
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={cn(
            'mt-5 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/20 bg-background/50',
            isProcessing && 'pointer-events-none opacity-80'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center space-y-3 py-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary animate-spin">
                <Loader2 className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-foreground">{progressStatus}</p>
              <p className="text-[11px] text-muted-foreground">Running validation & duplicate checks...</p>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <UploadCloud className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-bold text-foreground">
                  Click to browse or drag & drop files here
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Supports CSV spreadsheets, PDF contracts, RFPs, and customer reports (max 10MB)
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Badge variant="outline" className="text-[10px] space-x-1">
                  <FileSpreadsheet className="h-3 w-3 text-emerald-500" />
                  <span>CSV</span>
                </Badge>
                <Badge variant="outline" className="text-[10px] space-x-1">
                  <FileText className="h-3 w-3 text-rose-500" />
                  <span>PDF</span>
                </Badge>
                <Badge variant="outline" className="text-[10px] space-x-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span>AI Extractor</span>
                </Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
