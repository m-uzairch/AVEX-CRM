'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { allowedFileExtensions, maxFileSize } from '../../schemas/import-schemas';

interface ImportUploadStepProps {
  onFileSelected: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function ImportUploadStep({
  onFileSelected,
  isUploading,
}: ImportUploadStepProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [errorMsg, setErrorMsg] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMsg('');
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedFileExtensions.includes(ext) && !file.type.includes('csv') && !file.type.includes('spreadsheet') && !file.type.includes('pdf') && !file.type.includes('image')) {
      setErrorMsg(`Unsupported file type (.${ext}). Allowed formats: CSV, XLSX, PDF, PNG, JPG, WEBP.`);
      return;
    }

    if (file.size > maxFileSize) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum 20MB limit.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleStartParsing = async () => {
    if (!selectedFile) return;
    try {
      await onFileSelected(selectedFile);
    } catch (err: any) {
      setErrorMsg(err?.message || 'File upload failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-xs">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-foreground">Upload Lead Import File</h2>
        <p className="text-xs text-muted-foreground">
          Import leads from CSV, Excel (.xlsx), PDF, or scanned image documents (OCR).
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-border hover:border-primary/50 bg-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Upload className="h-7 w-7" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">
              Drag and drop your file here, or <span className="text-primary underline">browse</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Supports CSV, Excel (.xlsx), PDF documents, PNG, JPG, WEBP images (Max 20MB)
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Details */}
      {selectedFile && (
        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-3 truncate">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            <div className="truncate">
              <p className="font-bold text-foreground truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Progress & Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          size="sm"
          disabled={!selectedFile || isUploading}
          onClick={handleStartParsing}
          className="gap-2 text-xs"
        >
          {isUploading ? (
            <span>Analyzing File with Gemini AI & OCR...</span>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Proceed to AI Field Mapping</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
