'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import {
  ProjectFile,
  ProjectFolder,
  StorageSummary,
  FileCategory,
  FileViewMode,
} from '@/features/files/types/file-types';
import {
  fetchProjectFiles,
  createFolder,
  deleteProjectFolder,
} from '@/features/files/services/file-service';
import { StorageSummaryWidget } from '@/features/files/components/storage-summary-widget';
import { FilePreviewModal } from '@/features/files/components/file-preview-modal';
import { FileDetailsDrawer } from '@/features/files/components/file-details-drawer';
import { FileUploadDialog } from '@/features/files/components/file-upload-dialog';
import {
  Folder,
  FileText,
  FileUp,
  FolderPlus,
  Search,
  LayoutGrid,
  List,
  Eye,
  Download,
  ChevronRight,
  Loader2,
  Trash2,
} from 'lucide-react';

interface ProjectFilesTabProps {
  projectId: string;
}

export function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
  const [folders, setFolders] = React.useState<ProjectFolder[]>([]);
  const [files, setFiles] = React.useState<ProjectFile[]>([]);
  const [storageSummary, setStorageSummary] = React.useState<StorageSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Filters & State
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [folderBreadcrumbs, setFolderBreadcrumbs] = React.useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Root Directory' },
  ]);
  const [selectedCategory, setSelectedCategory] = React.useState<FileCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<FileViewMode>('grid');

  // Modals & Drawers
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [previewFile, setPreviewFile] = React.useState<ProjectFile | null>(null);
  const [selectedFileForDrawer, setSelectedFileForDrawer] = React.useState<ProjectFile | null>(null);

  const loadFiles = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchProjectFiles({
        projectId,
        folderId: currentFolderId || 'ROOT',
        category: selectedCategory,
        search: searchQuery,
      });
      setFolders(res.folders);
      setFiles(res.files);
      setStorageSummary(res.storageSummary);
    } catch (err) {
      console.error('Failed to load project files:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, currentFolderId, selectedCategory, searchQuery]);

  React.useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleNavigateFolder = (folder: ProjectFolder | null) => {
    if (!folder) {
      setCurrentFolderId(null);
      setFolderBreadcrumbs([{ id: null, name: 'Root Directory' }]);
    } else {
      setCurrentFolderId(folder.id);
      setFolderBreadcrumbs((prev) => [...prev.filter((b) => b.id !== folder.id), { id: folder.id, name: folder.name }]);
    }
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await createFolder(projectId, newFolderName, currentFolderId);
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      loadFiles();
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  const handleDeleteFolder = async (folder: ProjectFolder) => {
    if (confirm(`Are you sure you want to delete folder "${folder.name}"?`)) {
      await deleteProjectFolder(folder.id);
      loadFiles();
    }
  };

  return (
    <div className="space-y-4">
      {/* Storage Summary Bar */}
      {storageSummary && <StorageSummaryWidget summary={storageSummary} />}

      {/* Action Controls & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-xl shadow-2xs">
        {/* Search & Category Filter */}
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs bg-background h-8"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as FileCategory | 'ALL')}
            className="text-xs rounded-md border border-input bg-background p-1.5 font-medium h-8"
          >
            <option value="ALL">All Categories</option>
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

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-card">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateFolderOpen(true)}
            className="gap-1.5 text-xs h-8"
          >
            <FolderPlus className="h-3.5 w-3.5" /> New Folder
          </Button>

          <Button size="sm" onClick={() => setIsUploadOpen(true)} className="gap-1.5 text-xs h-8 font-bold">
            <FileUp className="h-3.5 w-3.5" /> Upload File
          </Button>
        </div>
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div className="flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border">
        {folderBreadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id || 'root'}>
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            <button
              onClick={() => {
                if (crumb.id === null) handleNavigateFolder(null);
              }}
              className={`hover:text-primary cursor-pointer ${
                idx === folderBreadcrumbs.length - 1 ? 'text-foreground font-bold' : ''
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Directory Content Area */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading project files...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Folders Row */}
          {folders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => handleNavigateFolder(folder)}
                  className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-200 shadow-2xs flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Folder className="h-5 w-5 text-amber-500 shrink-0" />
                    <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                      {folder.name}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder);
                    }}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Files Grid View */}
          {viewMode === 'grid' ? (
            files.length === 0 && folders.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">
                No files uploaded to this directory yet. Use &quot;Upload File&quot; above.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <Card
                    key={file.id}
                    onClick={() => setSelectedFileForDrawer(file)}
                    className="hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer group bg-card"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {file.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            file.isClientVisible
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {file.isClientVisible ? 'Client Visible' : 'Internal'}
                        </Badge>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                            {file.name}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            {(file.fileSize / 1024).toFixed(1)} KB • v{file.currentVersion}.0
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Downloading ${file.name}...`);
                          }}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            /* Table View */
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">File Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Visibility</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <button onClick={() => setSelectedFileForDrawer(file)} className="hover:underline text-left cursor-pointer">
                          {file.name}
                        </button>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px]">
                          {file.category}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono">{(file.fileSize / 1024).toFixed(1)} KB</td>
                      <td className="p-3 font-mono">v{file.currentVersion}.0</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-semibold ${file.isClientVisible ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {file.isClientVisible ? 'Client Visible' : 'Internal'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setPreviewFile(file)} className="h-7 text-xs">
                          Preview
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => alert(`Downloading ${file.name}...`)} className="h-7 text-xs">
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* File Upload Modal */}
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        projectId={projectId}
        folders={folders}
        activeFolderId={currentFolderId}
        onUploadSuccess={loadFiles}
      />

      {/* Create Folder Modal */}
      <Dialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        title="Create New Folder"
        description="Organize documents into structured folders."
      >
        <form onSubmit={handleCreateFolderSubmit} className="space-y-4 text-xs py-2">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Folder Name *</label>
            <Input
              placeholder="e.g. Design Wireframes & Assets"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newFolderName.trim()} className="font-bold">
              Create Folder
            </Button>
          </div>
        </form>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

      {/* File Details Drawer */}
      <FileDetailsDrawer
        file={selectedFileForDrawer}
        onClose={() => setSelectedFileForDrawer(null)}
        onFileUpdated={loadFiles}
      />
    </div>
  );
}
