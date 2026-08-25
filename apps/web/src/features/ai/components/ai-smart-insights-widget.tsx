'use client';

import * as React from 'react';
import { SmartInsightItem } from '../schemas/ai-assistant-schemas';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, Users, DollarSign, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AISmartInsightsWidgetProps {
  onOpenAssistant?: () => void;
}

export function AISmartInsightsWidget({ onOpenAssistant }: AISmartInsightsWidgetProps) {
  const [insights, setInsights] = React.useState<SmartInsightItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadInsights() {
      try {
        const res = await fetch('/api/ai/assistant/insights');
        if (res.ok) {
          const data = await res.json();
          setInsights(data.insights || []);
        }
      } catch {
        // Fallback handled gracefully
      } finally {
        setIsLoading(false);
      }
    }
    loadInsights();
  }, []);

  const getCategoryIcon = (cat: SmartInsightItem['category']) => {
    switch (cat) {
      case 'FINANCE':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'SALES':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'CUSTOMERS':
        return <Users className="h-4 w-4 text-indigo-500" />;
      case 'ATTENDANCE':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'OPERATIONS':
      default:
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    }
  };

  if (isLoading || insights.length === 0) return null;

  return (
    <Card className="border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/80 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
              Smart CRM Insights & Recommendations
            </CardTitle>
          </div>
        </div>

        {onOpenAssistant && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenAssistant}
            className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            <span>Open AI Assistant</span>
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-border bg-background/60 backdrop-blur-xs flex flex-col justify-between space-y-2 hover:border-primary/40 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {getCategoryIcon(item.category)}
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {item.category}
                  </Badge>
                </div>
                {item.priority === 'HIGH' && (
                  <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px] font-bold">
                    Action Required
                  </Badge>
                )}
              </div>

              <h4 className="text-xs font-bold text-foreground leading-snug">{item.title}</h4>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-primary">{item.metric}</span>
              <Link
                href={item.actionUrl}
                className="text-[11px] font-bold text-foreground hover:text-primary transition-colors flex items-center"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="h-2.5 w-2.5 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
