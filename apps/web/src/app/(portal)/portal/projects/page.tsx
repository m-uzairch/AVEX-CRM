'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientProjectOverview } from '@/features/portal/types/portal-types';
import { fetchClientProjects } from '@/features/portal/services/portal-service';
import { FolderKanban, ExternalLink, Loader2 } from 'lucide-react';

export default function ClientProjectsPage() {
  const [projects, setProjects] = React.useState<ClientProjectOverview[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchClientProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <FolderKanban className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Projects</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Read-only view of your company&apos;s active and completed project workspaces.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          No projects found for your client account.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="hover:border-primary/40 transition-all duration-200 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {p.projectCode}
                      </span>
                      <Badge variant="outline" className="text-[10px] capitalize font-medium">
                        {p.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-base text-foreground">{p.name}</h3>
                  </div>

                  <Link href={`/portal/projects/${p.id}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      View <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Active Phase: {p.currentPhase}</span>
                    <span className="text-primary font-bold">{p.completionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${p.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
