/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { ProjectHistoryEvent } from '../../types/project-completion-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { History, Calendar, CheckCircle2, Send, Archive, RefreshCw, Loader2, FileText, User } from 'lucide-react';

interface ProjectHistoryTimelineProps {
  projectId: string;
}

export function ProjectHistoryTimeline({ projectId }: ProjectHistoryTimelineProps) {
  const [history, setHistory] = React.useState<ProjectHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load project history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    if (projectId) {
      fetchHistory();
    }
  }, [projectId, fetchHistory]);

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'CREATION':
        return <Calendar className="h-3.5 w-3.5 text-blue-500" />;
      case 'DELIVERY':
        return <Send className="h-3.5 w-3.5 text-purple-500" />;
      case 'APPROVAL':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case 'ARCHIVE':
        return <Archive className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-indigo-500" />;
    }
  };

  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <History className="h-4 w-4 text-primary" />
            <span>Permanent Project Audit History</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Complete chronological record of all creation, milestone, delivery, approval, and archive events.
          </CardDescription>
        </div>
        <button
          onClick={fetchHistory}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh History
        </button>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground text-xs">
            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-primary" />
            Loading project history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">
            No history events recorded for this project.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
            {history.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline Node Dot */}
                <div className="absolute -left-[27px] top-0.5 p-1 rounded-full bg-background border border-border shadow-2xs group-hover:border-primary transition-colors">
                  {renderCategoryIcon(event.category)}
                </div>

                {/* Event Box */}
                <div className="bg-card border border-border/70 rounded-lg p-3 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-foreground">{event.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {new Date(event.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">{event.description}</p>

                  {event.performedBy && (
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <User className="h-3 w-3 text-primary" />
                      <span>{event.performedBy.fullName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
