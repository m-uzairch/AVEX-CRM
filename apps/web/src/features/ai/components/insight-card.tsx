'use client';

import * as React from 'react';
import { SmartInsight } from '../schemas/smart-insights-schemas';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface InsightCardProps {
  insight: SmartInsight;
  onDismiss: (id: string) => void;
  onActionTrigger?: (insight: SmartInsight) => void;
}

export function InsightCard({ insight, onDismiss, onActionTrigger }: InsightCardProps) {
  const getCategoryIcon = (cat: SmartInsight['category']) => {
    switch (cat) {
      case 'FINANCE':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'SALES':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'CUSTOMERS':
        return <Users className="h-4 w-4 text-indigo-500" />;
      case 'ATTENDANCE':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'PROJECTS':
      case 'OPERATIONS':
      default:
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    }
  };

  const getPriorityBadge = (priority: SmartInsight['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold">
            Critical Action Required
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
            High Priority
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] font-semibold">
            Medium Priority
          </Badge>
        );
      case 'LOW':
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground font-semibold">
            Informational
          </Badge>
        );
    }
  };

  return (
    <Card
      className={cn(
        'border transition-all duration-200 hover:shadow-md overflow-hidden bg-card/80 backdrop-blur-xs',
        insight.priority === 'CRITICAL'
          ? 'border-rose-500/30 bg-rose-500/5'
          : insight.priority === 'HIGH'
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-border'
      )}
    >
      <CardContent className="p-5 space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-background border border-border shadow-2xs">
              {getCategoryIcon(insight.category)}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                {insight.category}
              </Badge>
              {getPriorityBadge(insight.priority)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(insight.id)}
            title="Dismiss Insight"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground leading-snug">{insight.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
        </div>

        {/* AI Explanation Box */}
        {insight.aiExplanation && (
          <div className="p-3 rounded-lg bg-background/80 border border-primary/20 space-y-1">
            <div className="flex items-center space-x-1.5 text-primary text-[11px] font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Strategic Analysis & Action Plan</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {insight.aiExplanation}
            </p>
          </div>
        )}

        {/* Footer & Action Button */}
        <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {insight.impactMetric ? (
            <div className="text-xs font-bold text-foreground">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Impact Metric
              </span>
              <span>{insight.impactMetric}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <Link
              href={insight.action.url}
              onClick={() => onActionTrigger?.(insight)}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <span>{insight.action.label}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
