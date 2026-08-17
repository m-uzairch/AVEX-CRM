'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProjectFile } from '../types/file-types';
import {
  updateFileMetadata,
  uploadFileVersion,
  deleteProjectFile,
} from '../services/file-service';
import {
  Download,
  History,
  Trash2,
  Plus,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FileDetailsDrawerProps {
  file: ProjectFile | null;
  onClose: () => void;
  onFileUpdated: () => void;
}

export function FileDetailsDrawer({
  file,
  onClose,
  onFileUpdated,
}: FileDetailsDrawerProps) {
  const [showVersionForm, setShowVersionForm] = React.useState(false);
  const [changeNotes, setChangeNotes] = React.useState('');
  const [uploading, setUploading] = React.useState(false);

  if (!file) return null;

  const handleToggleVisibility = async () => {
    try {
      await updateFileMetadata(file.id, { isClientVisible: !file.isClientVisible });
      onFileUpdated();
    } catch (err) {
      console.error('Failed to update client visibility:', err);
    }
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      await uploadFileVersion(file.id, {
        fileUrl: file.fileUrl,
        fileSize: file.fileSize + 2048, // Simulated updated version size
        changeNotes: changeNotes || `Updated to Version ${file.currentVersion + 1}`,
      });
      setChangeNotes('');
      setShowVersionForm(false);
      onFileUpdated();
    } catch (err) {
      console.error('Failed to upload version:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete file "${file.name}"?`)) {
      await deleteProjectFile(file.id);
      onClose();
      onFileUpdated();
    }
  };

  return (
    <Dialog
      isOpen={!!file}
      onClose={onClose}
      title={file.name}
      description={`Original name: ${file.originalName}`}
      className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6 text-xs py-2">
        {/* Metadata Summary Card */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-bold">
                {file.category}
              </Badge>
              <Badge variant="secondary" className="font-mono">
                v{file.currentVersion}.0
              </Badge>
              <Badge variant="outline" className={`font-semibold ${file.isClientVisible ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
                {file.isClientVisible ? 'Client Visible' : 'Internal Only'}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVisibility}
              className="gap-1.5 text-[11px] h-7"
            >
              {file.isClientVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {file.isClientVisible ? 'Hide from Client' : 'Make Client Visible'}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
            <div>
              <span className="text-muted-foreground uppercase font-semibold block text-[10px]">Size</span>
              <span className="font-mono font-bold text-foreground">{(file.fileSize / 1024).toFixed(1)} KB</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase font-semibold block text-[10px]">Uploaded By</span>
              <span className="font-medium text-foreground">{file.uploadedBy?.fullName || 'Alex Carter'}</span>
            </div>
            <div>
              <span className="text-muted-foreground uppercase font-semibold block text-[10px]">Upload Date</span>
              <span className="font-medium text-foreground">
                {new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Version History Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground uppercase text-[10px] flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-primary" /> Version History ({file.versions?.length || 1})
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowVersionForm(!showVersionForm)}
              className="gap-1.5 text-xs h-7"
            >
              <Plus className="h-3.5 w-3.5" /> Upload New Version
            </Button>
          </div>

          {showVersionForm && (
            <form onSubmit={handleUploadVersion} className="p-3 rounded-lg border border-primary/40 bg-primary/5 space-y-2">
              <span className="font-bold text-foreground">Upload Version {file.currentVersion + 1}</span>
              <Input
                placeholder="Change notes (e.g. Incorporated client feedback on section 2)"
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                className="text-xs bg-background"
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowVersionForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={uploading} className="gap-1.5">
                  {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save New Version
                </Button>
              </div>
            </form>
          )}

          <div className="divide-y divide-border border border-border rounded-lg bg-card overflow-hidden">
            {file.versions && file.versions.length > 0 ? (
              file.versions.map((ver) => (
                <div key={ver.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-primary">v{ver.versionNumber}.0</span>
                      <span className="font-medium text-foreground">{ver.changeNotes || 'Initial upload'}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      {new Date(ver.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground">
                    {(ver.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted-foreground text-xs">
                Version 1.0 (Current)
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1.5 text-xs">
            <Trash2 className="h-3.5 w-3.5" /> Delete File
          </Button>

          <Button size="sm" onClick={() => alert(`Downloading file "${file.name}"...`)} className="gap-1.5 text-xs font-bold">
            <Download className="h-4 w-4" /> Download File
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
