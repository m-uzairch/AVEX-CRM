'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClientFile, ClientProjectOverview } from '@/features/portal/types/portal-types';
import {
  clientFileUploadSchema,
  ClientFileUploadValues,
} from '@/features/portal/schemas/portal-schemas';
import {
  fetchClientFiles,
  uploadClientFile,
  fetchClientProjects,
} from '@/features/portal/services/portal-service';
import {
  Folder,
  FileText,
  Download,
  Loader2,
  Calendar,
  FolderKanban,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Upload,
  Search,
  Plus,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function ClientFilesPage() {
  const [files, setFiles] = React.useState<ClientFile[]>([]);
  const [projects, setProjects] = React.useState<ClientProjectOverview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [filesData, projsData] = await Promise.all([
        fetchClientFiles({
          category: filter,
          search: searchQuery,
        }),
        fetchClientProjects(),
      ]);
      setFiles(filesData || []);
      setProjects(projsData || []);
    } catch (err) {
      console.error('Failed to load client files:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFileUploadValues>({
    resolver: zodResolver(clientFileUploadSchema),
    defaultValues: {
      projectId: '',
      name: '',
      category: 'DOCUMENTS',
      fileUrl: '',
      fileSize: 1024 * 1024,
      fileType: 'application/pdf',
    },
  });

  const onUploadSubmit = async (values: ClientFileUploadValues) => {
    try {
      setUploading(true);
      setUploadError(null);
      await uploadClientFile(values);
      setIsUploadModalOpen(false);
      reset();
      await loadData();
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to register file. Please verify inputs.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string, fileName = '') => {
    const combined = (fileType + ' ' + fileName).toLowerCase();
    if (combined.includes('pdf') || combined.includes('doc') || combined.includes('txt')) {
      return <FileText className="h-5 w-5 text-rose-500" />;
    }
    if (combined.includes('sheet') || combined.includes('csv') || combined.includes('xls')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    }
    if (combined.includes('image') || combined.includes('png') || combined.includes('jpg') || combined.includes('jpeg') || combined.includes('webp')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    }
    return <FileCode className="h-5 w-5 text-purple-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '1.2 MB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const categories = [
    'ALL',
    'DOCUMENTS',
    'DESIGNS',
    'CONTRACTS',
    'REPORTS',
    'INVOICES',
    'QUOTATIONS',
    'OTHER',
  ];

  const totalCount = files.length;
  const docsCount = files.filter((f) => f.category === 'DOCUMENTS').length;
  const designsCount = files.filter((f) => f.category === 'DESIGNS').length;
  const contractsCount = files.filter((f) => f.category === 'CONTRACTS').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Folder className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Files & Deliverables</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Access, download, and share design deliverables, contracts, specifications, and project assets securely.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2 text-xs font-semibold shadow-xs">
            <Upload className="h-4 w-4" /> Upload / Share File
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-muted-foreground">Total Files</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalCount}</p>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Documents</p>
          <p className="text-2xl font-bold text-foreground mt-1">{docsCount}</p>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Designs & Assets</p>
          <p className="text-2xl font-bold text-foreground mt-1">{designsCount}</p>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Contracts</p>
          <p className="text-2xl font-bold text-foreground mt-1">{contractsCount}</p>
        </Card>
      </div>

      {/* Search and Category Filter Strip */}
      <Card className="p-3 bg-card border-border">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  filter === cat
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase().replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search file names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Files Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="font-medium">Loading shared files...</span>
        </div>
      ) : files.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground border-dashed">
          <Folder className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground">No Files Found</p>
          <p className="mt-1 mb-5 max-w-sm mx-auto text-xs text-muted-foreground">
            {searchQuery || filter !== 'ALL'
              ? 'No files match your selected category or search filter.'
              : 'No project files or deliverable assets have been shared yet.'}
          </p>
          <Button size="sm" onClick={() => setIsUploadModalOpen(true)} className="gap-2 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" /> Share a File
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card
              key={file.id}
              className="hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between bg-card"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3 truncate">
                    <div className="p-2.5 rounded-xl bg-muted/60 border border-border shrink-0">
                      {getFileIcon(file.fileType || '', file.name)}
                    </div>
                    <div className="space-y-0.5 truncate">
                      <p className="font-bold text-sm text-foreground truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
                    {file.category}
                  </Badge>
                </div>

                {file.project && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate pt-1 border-t border-border/50 font-medium">
                    <FolderKanban className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">[{file.project.projectCode}] {file.project.name}</span>
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>

                  <a
                    href={file.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name}
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 font-semibold">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Upload / Share Project Asset
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onUploadSubmit)} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Associated Project *</label>
                <select
                  {...register('projectId')}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Choose your project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-destructive text-[11px] font-medium">{errors.projectId.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">File Label / Name *</label>
                <Input
                  {...register('name')}
                  placeholder="e.g. Brand_Guidelines_v2.pdf, Hero_Asset.png..."
                  className="text-xs"
                />
                {errors.name && (
                  <p className="text-destructive text-[11px] font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Category *</label>
                <select
                  {...register('category')}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="DOCUMENTS">Documents</option>
                  <option value="DESIGNS">Designs & Creative Assets</option>
                  <option value="CONTRACTS">Contracts & Agreements</option>
                  <option value="REPORTS">Reports & Specifications</option>
                  <option value="INVOICES">Invoices</option>
                  <option value="QUOTATIONS">Quotations</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">File Download URL / Cloud Link *</label>
                <Input
                  {...register('fileUrl')}
                  placeholder="https://drive.google.com/..., https://dropbox.com/..., https://cdn.example.com/..."
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Paste the direct link to the document, Figma export, or cloud storage file.
                </p>
                {errors.fileUrl && (
                  <p className="text-destructive text-[11px] font-medium">{errors.fileUrl.message}</p>
                )}
              </div>

              <div className="pt-3 border-t border-border flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={uploading} className="font-semibold gap-1.5">
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    'Register File'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
