'use client';

import * as React from 'react';
import {
  SmartInsight,
  InsightsSummaryKPIs,
} from '../schemas/smart-insights-schemas';
import { SmartInsightsKpiBar } from './smart-insights-kpi-bar';
import { InsightCard } from './insight-card';
import { AIAssistantDrawer } from './ai-assistant-drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/providers/toast-provider';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Search,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

export function SmartInsightsHub() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [insights, setInsights] = React.useState<SmartInsight[]>([]);
  const [summary, setSummary] = React.useState<InsightsSummaryKPIs>({
    totalActive: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    totalCashAtRisk: 0,
    pipelineOpportunityValue: 0,
  });
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);

  const fetchInsights = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedPriority !== 'ALL') params.append('priority', selectedPriority);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/ai/insights?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load insights feed');
      }

      const data = await res.json();
      setInsights(data.insights || []);
      setSummary(
        data.summary || {
          totalActive: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          totalCashAtRisk: 0,
          pipelineOpportunityValue: 0,
        }
      );
    } catch (err: any) {
      toastError('Load Failed', err.message || 'Could not fetch smart insights');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedPriority, searchQuery, toastError]);

  React.useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/insights/${id}/dismiss`, { method: 'POST' });
      if (res.ok) {
        setInsights((prev) => prev.filter((i) => i.id !== id));
        toastSuccess('Insight Dismissed', 'Recommendation removed from active feed.');
      }
    } catch {
      // Local optimistic removal
      setInsights((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleActionTrigger = async (insight: SmartInsight) => {
    try {
      await fetch(`/api/ai/insights/${insight.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionLabel: insight.action.label,
          url: insight.action.url,
          entityType: insight.entityType,
        }),
      });
    } catch {
      // Ignore
    }
  };

  const CATEGORY_TABS: Array<{ key: string; label: string }> = [
    { key: 'ALL', label: 'All Insights' },
    { key: 'FINANCE', label: 'Financial Risks' },
    { key: 'SALES', label: 'Sales Opportunities' },
    { key: 'CUSTOMERS', label: 'Customer Retention' },
    { key: 'PROJECTS', label: 'Project Deadlines' },
    { key: 'ATTENDANCE', label: 'Team Operations' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Smart Insights & AI Recommendations</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Deterministic business intelligence continuously analyzing invoices, pipeline health, client engagement, and operational schedules.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchInsights()}
            disabled={isLoading}
            className="h-9 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsAssistantOpen(true)}
            className="h-9 text-xs shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            <span>Ask AI Assistant</span>
          </Button>
        </div>
      </div>

      {/* KPI Bar */}
      <SmartInsightsKpiBar summary={summary} />

      {/* Category Tabs & Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                  selectedCategory === tab.key
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Priority & Search Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-8 bg-background border border-border rounded-md px-2 text-xs font-medium focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Informational</option>
            </select>
          </div>
        </div>

        {/* Insight Cards Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
            <p>Evaluating multi-tenant business rules and real-time CRM metrics...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl border-border bg-card/50 space-y-2">
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">All Clear! No Pending Action Required</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your company pipeline, overdue balances, and project deliverables are currently in good health.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDismiss={handleDismiss}
                onActionTrigger={handleActionTrigger}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}
