'use client';

import * as React from 'react';
import {
  AIAutomationItem,
  AutomationSummaryKPIs,
} from '../schemas/ai-automation-schemas';
import { AIAutomationCard } from './ai-automation-card';
import { AIAutomationActionModal } from './ai-automation-action-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Layers,
} from 'lucide-react';

export function AIAutomationsHub() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [items, setItems] = React.useState<AIAutomationItem[]>([]);
  const [summary, setSummary] = React.useState<AutomationSummaryKPIs>({
    pendingCount: 0,
    executedCount: 0,
    dismissedCount: 0,
    highUrgencyCount: 0,
  });
  const [selectedTab, setSelectedTab] = React.useState<'PENDING' | 'EXECUTED' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isScanning, setIsScanning] = React.useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = React.useState<AIAutomationItem | null>(null);

  const fetchAutomations = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/automations');
      if (!res.ok) throw new Error('Failed to load automation queue');
      const data = await res.json();
      setItems(data.items || []);
      setSummary(
        data.summary || {
          pendingCount: 0,
          executedCount: 0,
          dismissedCount: 0,
          highUrgencyCount: 0,
        }
      );
    } catch (err: any) {
      toastError('Load Failed', err.message || 'Error fetching automations');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/ai/automations/run-scan', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to run CRM scan');
      const data = await res.json();
      toastSuccess('Scan Complete', data.message);
      await fetchAutomations();
    } catch (err: any) {
      toastError('Scan Failed', err.message || 'Error running automation scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/automations/${id}/dismiss`, { method: 'POST' });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: 'DISMISSED' as const } : i))
        );
        toastSuccess('Action Dismissed', 'Automation removed from pending queue.');
        setSummary((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          dismissedCount: prev.dismissedCount + 1,
        }));
      }
    } catch {
      // Local fallback
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'DISMISSED' as const } : i))
      );
    }
  };

  // Filter items based on tab and search
  let filtered = items;
  if (selectedTab === 'PENDING') {
    filtered = filtered.filter((i) => i.status === 'PENDING_APPROVAL');
  } else if (selectedTab === 'EXECUTED') {
    filtered = filtered.filter((i) => i.status === 'EXECUTED');
  }

  if (searchQuery.trim()) {
    const s = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s) ||
        i.triggerType.toLowerCase().includes(s)
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-foreground">AI Automation & Proactive CRM Actions</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Controlled automation engine identifying repetitive follow-ups, payment reminders, and project scheduling tasks.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchAutomations()}
            disabled={isLoading}
            className="h-9 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleRunScan}
            disabled={isScanning}
            className="h-9 text-xs shadow-xs"
          >
            <Play className={cn('h-3.5 w-3.5 mr-1.5', isScanning && 'animate-spin')} />
            <span>Scan CRM for Automations</span>
          </Button>
        </div>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="border-amber-500/20 bg-amber-500/5 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Pending Approval
              </span>
              <p className="text-xl font-extrabold text-foreground mt-0.5">{summary.pendingCount}</p>
              <span className="text-[10px] text-muted-foreground">Ready for user review</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/5 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                High Urgency
              </span>
              <p className="text-xl font-extrabold text-foreground mt-0.5">{summary.highUrgencyCount}</p>
              <span className="text-[10px] text-muted-foreground">Critical payments & deals</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Executed History
              </span>
              <p className="text-xl font-extrabold text-foreground mt-0.5">{summary.executedCount}</p>
              <span className="text-[10px] text-muted-foreground">Dispatched workflows</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Dismissed
              </span>
              <p className="text-xl font-extrabold text-foreground mt-0.5">{summary.dismissedCount}</p>
              <span className="text-[10px] text-muted-foreground">Archived proposals</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
          {/* Tabs */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSelectedTab('PENDING')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                selectedTab === 'PENDING'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              Pending Approval ({summary.pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('EXECUTED')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                selectedTab === 'EXECUTED'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              Executed History ({summary.executedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('ALL')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                selectedTab === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              All Queue ({items.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
            <p>Loading automation queue and eligibility rules...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border bg-card/50 space-y-2">
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">No Pending Automations</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              All CRM follow-ups, payment reminders, and project tasks have been resolved.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <AIAutomationCard
                key={item.id}
                item={item}
                onReview={(it) => setSelectedItemForModal(it)}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AIAutomationActionModal
        item={selectedItemForModal}
        isOpen={Boolean(selectedItemForModal)}
        onClose={() => setSelectedItemForModal(null)}
        onExecuted={() => fetchAutomations()}
      />
    </div>
  );
}
