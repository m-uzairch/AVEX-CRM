'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClientProjectTask } from '../types/portal-types';
import {
  ListTodo,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Clock,
  Flag,
  Sparkles,
  Tag,
} from 'lucide-react';

interface ClientProjectTasksViewProps {
  tasks: ClientProjectTask[];
  selectedCategory?: 'ALL' | 'ATTENTION' | 'IN_PROGRESS' | 'TODO' | 'COMPLETED';
  onCategoryChange?: (cat: 'ALL' | 'ATTENTION' | 'IN_PROGRESS' | 'TODO' | 'COMPLETED') => void;
}

export function ClientProjectTasksView({
  tasks,
  selectedCategory = 'ALL',
  onCategoryChange,
}: ClientProjectTasksViewProps) {
  const [activeCategory, setActiveCategory] = React.useState<'ALL' | 'ATTENTION' | 'IN_PROGRESS' | 'TODO' | 'COMPLETED'>(
    selectedCategory
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState<'ALL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [sortBy, setSortBy] = React.useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');

  // Sync external category changes if provided
  React.useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (cat: 'ALL' | 'ATTENTION' | 'IN_PROGRESS' | 'TODO' | 'COMPLETED') => {
    setActiveCategory(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  // Compute counts
  const totalCount = tasks.length;
  const attentionCount = tasks.filter((t) => t.requiresClientAction || t.status === 'REVIEW').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todoCount = tasks.filter((t) => t.status === 'TODO' || t.status === 'BLOCKED').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  // Filter tasks
  const filtered = tasks.filter((t) => {
    // Category filter
    if (activeCategory === 'ATTENTION') {
      if (!t.requiresClientAction && t.status !== 'REVIEW') return false;
    } else if (activeCategory === 'IN_PROGRESS') {
      if (t.status !== 'IN_PROGRESS') return false;
    } else if (activeCategory === 'TODO') {
      if (t.status !== 'TODO' && t.status !== 'BLOCKED') return false;
    } else if (activeCategory === 'COMPLETED') {
      if (t.status !== 'COMPLETED') return false;
    }

    // Priority filter
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description ? t.description.toLowerCase().includes(q) : false;
      const matchLabel = t.labels ? t.labels.some((l) => l.toLowerCase().includes(q)) : false;
      if (!matchTitle && !matchDesc && !matchLabel) return false;
    }

    return true;
  });

  // Sort tasks
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      const pWeights: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'No due date';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="bg-card border border-border shadow-2xs">
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" /> Project Tasks & Progress
            </CardTitle>
            <CardDescription>
              Track completed items, active developments, upcoming deliverables, and tasks requiring your review.
            </CardDescription>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks or labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-8"
            />
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
          <div className="flex items-center space-x-1.5 p-1 bg-muted/60 rounded-xl border border-border/80 overflow-x-auto max-w-full">
            <button
              onClick={() => handleCategorySelect('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Tasks ({totalCount})
            </button>
            <button
              onClick={() => handleCategorySelect('ATTENTION')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeCategory === 'ATTENTION'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold shadow-2xs'
                  : 'text-rose-600/80 hover:text-rose-600'
              }`}
            >
              <AlertTriangle className="h-3 w-3" /> Requires Attention ({attentionCount})
            </button>
            <button
              onClick={() => handleCategorySelect('IN_PROGRESS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'IN_PROGRESS'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => handleCategorySelect('TODO')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'TODO'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upcoming ({todoCount})
            </button>
            <button
              onClick={() => handleCategorySelect('COMPLETED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'COMPLETED'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Priority & Sorting Options */}
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="createdAt">Sort by Newest</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <ListTodo className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="font-semibold text-foreground text-sm">No tasks found</p>
            <p>
              {searchQuery || priorityFilter !== 'ALL'
                ? 'No project tasks match the applied filter criteria.'
                : activeCategory === 'ATTENTION'
                ? 'No tasks currently require your attention or review. You are all caught up!'
                : 'No tasks have been scheduled in this category yet.'}
            </p>
            {(searchQuery || priorityFilter !== 'ALL' || activeCategory !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('ALL');
                  handleCategorySelect('ALL');
                }}
                className="mt-2 text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {sorted.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isAttention = task.requiresClientAction || task.status === 'REVIEW';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isAttention
                      ? 'bg-rose-500/5 border-rose-500/40 shadow-2xs ring-1 ring-rose-500/20'
                      : isCompleted
                      ? 'bg-muted/20 border-border/70 opacity-90'
                      : 'bg-card border-border/80 hover:border-primary/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : task.status === 'IN_PROGRESS' ? (
                          <PlayCircle className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                        ) : isAttention ? (
                          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        )}

                        <span className={`font-bold text-sm ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.title}
                        </span>

                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            task.priority === 'URGENT' || task.priority === 'HIGH'
                              ? 'text-rose-600 border-rose-500/20 bg-rose-500/10'
                              : task.priority === 'MEDIUM'
                              ? 'text-amber-600 border-amber-500/20 bg-amber-500/10'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <Flag className="h-2.5 w-2.5 mr-1" /> {task.priority}
                        </Badge>

                        {isAttention && (
                          <Badge className="text-[10px] bg-rose-600 text-white font-bold animate-pulse">
                            <Sparkles className="h-2.5 w-2.5 mr-1" /> Action Required: Review
                          </Badge>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          {task.description}
                        </p>
                      )}

                      {/* Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pl-6 pt-1">
                          {task.labels.map((lbl) => (
                            <span
                              key={lbl}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60"
                            >
                              <Tag className="h-2.5 w-2.5" /> {lbl}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status & Due Date */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 text-xs">
                      <Badge
                        variant={
                          isCompleted
                            ? 'secondary'
                            : task.status === 'IN_PROGRESS'
                            ? 'default'
                            : isAttention
                            ? 'destructive'
                            : 'outline'
                        }
                        className="text-[10px]"
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className={`h-3.5 w-3.5 ${task.isOverdue ? 'text-rose-500' : 'text-primary'}`} />
                        <span className={task.isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                          {task.isOverdue ? `Overdue (${formatDate(task.dueDate)})` : formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
