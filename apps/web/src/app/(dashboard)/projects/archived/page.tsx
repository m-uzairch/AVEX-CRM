/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Archive, RotateCcw, Search, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/providers/toast-provider';

export default function ArchivedProjectsPage() {
  const toastCtx = useToast();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [restoringId, setRestoringId] = React.useState<string | null>(null);

  const fetchArchivedProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects/archived');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load archived projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchArchivedProjects();
  }, [fetchArchivedProjects]);

  const handleRestore = async (id: string, name: string) => {
    setRestoringId(id);
    try {
      const res = await fetch(`/api/projects/${id}/restore`, {
        method: 'POST',
      });
      if (res.ok) {
        toastCtx.success('Project Restored', `Project "${name}" has been restored to active projects.`);
        fetchArchivedProjects();
      } else {
        toastCtx.error('Restore Failed', 'Unable to restore archived project.');
      }
    } catch (err) {
      console.error('Restore failed:', err);
      toastCtx.error('Restore Error', 'Failed to restore project.');
    } finally {
      setRestoringId(null);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ContentContainer>
      <PageHeader
        title="Archived Projects Repository"
        description="Historical repository of completed and archived project workspaces. Read-only access with full data preservation."
        breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: 'Archived Projects' }]}
        actions={
          <Link href="/projects">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Active Projects</span>
            </Button>
          </Link>
        }
      />

      <div className="space-y-6 text-xs mt-4">
        {/* Search Toolbar */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search archived project name, code, or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          <div className="text-xs font-semibold text-muted-foreground">
            {filteredProjects.length} Archived Projects
          </div>
        </div>

        {/* Projects List Table */}
        <Card className="shadow-2xs border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <Archive className="h-4 w-4 text-amber-500" />
              <span>Archived Project Repositories</span>
            </CardTitle>
            <CardDescription className="text-xs">
              All project tasks, milestones, documents, and historical activities remain preserved.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading archived projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No archived projects found matching search query.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-4">Code & Project</th>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3">Manager</th>
                    <th className="py-2.5 px-3">Completion</th>
                    <th className="py-2.5 px-3">Archived Date</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/projects/${p.id}`} className="group">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span className="font-mono text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-xs">
                              {p.projectCode}
                            </span>
                            <span>{p.name}</span>
                          </div>
                        </Link>
                      </td>

                      <td className="py-3 px-3 font-medium text-foreground">{p.customerName}</td>
                      <td className="py-3 px-3 text-muted-foreground">{p.projectManagerName}</td>

                      <td className="py-3 px-3">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold">
                          {p.completionPercentage}% Completed
                        </Badge>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground font-mono">{p.archivedAt}</td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(p.id, p.name)}
                          disabled={restoringId === p.id}
                          className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          {restoringId === p.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          <span>Restore Project</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentContainer>
  );
}
