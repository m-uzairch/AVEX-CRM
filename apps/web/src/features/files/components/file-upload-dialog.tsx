'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectFolder, FileCategory } from '../types/file-types';
import { uploadProjectFile } from '../services/file-service';
import { FileUp, Loader2 } from 'lucide-react';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  folders: ProjectFolder[];
  activeFolderId?: string | null;
  onUploadSuccess: () => void;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  projectId,
  folders,
  activeFolderId,
  onUploadSuccess,
}: FileUploadDialogProps) {
  const [fileName, setFileName] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<FileCategory>('DOCUMENTS');
  const [selectedFolderId, setSelectedFolderId] = React.useState<string>(activeFolderId || '');
  const [isClientVisible, setIsClientVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (activeFolderId) setSelectedFolderId(activeFolderId);
  }, [activeFolderId]);

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    try {
      setLoading(true);
      await uploadProjectFile({
        projectId,
        folderId: selectedFolderId && selectedFolderId !== 'ROOT' ? selectedFolderId : null,
        name: fileName,
        originalName: fileName,
        fileUrl: `/uploads/${fileName.toLowerCase().replace(/\s+/g, '_')}`,
        fileSize: Math.floor(Math.random() * (5 * 1024 * 1024 - 100 * 1024) + 100 * 1024), // Random 100KB-5MB
        fileType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        category: selectedCategory,
        isClientVisible,
      });

      setFileName('');
      setIsClientVisible(false);
      onOpenChange(false);
      onUploadSuccess();
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Upload Project File"
      description="Upload project documents, wireframes, contracts, or deliverables."
      className="sm:max-w-[550px]"
    >
      <form onSubmit={handleSimulatedUpload} className="space-y-4 text-xs py-2">
        {/* Drag & Drop Upload Zone */}
        <div className="p-6 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-center space-y-2 hover:border-primary transition-colors cursor-pointer">
          <FileUp className="h-10 w-10 text-primary mx-auto" />
          <div>
            <p className="font-bold text-foreground">Drag and drop files here</p>
            <p className="text-[11px] text-muted-foreground">Supported formats: PDF, DOCX, XLSX, PNG, JPG, ZIP, JSON (Max 100 MB)</p>
          </div>
        </div>

        {/* File Name */}
        <div className="space-y-1">
          <label className="font-semibold text-foreground">
            File Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. AVEX_Brand_Identity_Guide_V1.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FileCategory)}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5"
            >
              <option value="DOCUMENTS">Documents</option>
              <option value="DESIGNS">Designs</option>
              <option value="CONTRACTS">Contracts</option>
              <option value="REPORTS">Reports</option>
              <option value="IMAGES">Images</option>
              <option value="DEVELOPMENT">Development</option>
              <option value="DELIVERABLES">Deliverables</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Folder */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Folder</label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5"
            >
              <option value="">Root Directory</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Client Visibility Toggle */}
        <div className="pt-2">
          <label className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-card cursor-pointer">
            <input
              type="checkbox"
              checked={isClientVisible}
              onChange={(e) => setIsClientVisible(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <div>
              <span className="font-bold text-foreground block">Make File Visible to Client</span>
              <span className="text-[10px] text-muted-foreground">
                Client-visible files automatically sync to the Client Portal for client downloads.
              </span>
            </div>
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !fileName.trim()} className="gap-2 font-bold">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload File
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
