/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Paperclip, FileText, Image as ImageIcon, FileSpreadsheet, X, UploadCloud, Download } from 'lucide-react';
import { NoteAttachment } from '../../types/activity-note-types';
import { NoteService } from '../../services/note-service';

interface FileAttachmentPickerProps {
  attachments: NoteAttachment[];
  onChange: (attachments: NoteAttachment[]) => void;
  disabled?: boolean;
}

export function FileAttachmentPicker({
  attachments,
  onChange,
  disabled = false,
}: FileAttachmentPickerProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setErrorMsg(null);
    setIsUploading(true);

    try {
      const uploaded = await NoteService.uploadAttachment(file);
      onChange([...attachments, uploaded]);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to upload attachment.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'PNG':
      case 'JPG':
      case 'JPEG':
        return <ImageIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
      case 'XLSX':
        return <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
      case 'PDF':
        return <FileText className="h-3.5 w-3.5 text-red-500 shrink-0" />;
      default:
        return <Paperclip className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors font-medium text-xs disabled:opacity-50"
        >
          {isUploading ? (
            <UploadCloud className="h-3.5 w-3.5 animate-bounce text-primary" />
          ) : (
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span>{isUploading ? 'Uploading file...' : 'Attach File (PDF, PNG, DOCX)'}</span>
        </button>

        <span className="text-[11px] text-muted-foreground">Max file size: 10MB</span>
      </div>

      {errorMsg && (
        <div className="text-[11px] text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20 font-medium">
          {errorMsg}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-card border border-border/80 text-xs shadow-2xs hover:border-border transition-colors"
            >
              {renderFileIcon(att.fileType)}
              <a
                href={att.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:text-primary underline truncate max-w-[150px]"
                title={att.fileName}
              >
                {att.fileName}
              </a>
              <span className="text-[10px] text-muted-foreground">({formatBytes(att.fileSize)})</span>

              <a
                href={att.fileUrl}
                download={att.fileName}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                title="Download"
              >
                <Download className="h-3 w-3" />
              </a>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                  title="Remove Attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
