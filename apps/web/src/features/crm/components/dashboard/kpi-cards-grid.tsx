'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  UserPlus,
  CheckCircle2,
  Trophy,
  TrendingUp,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { KPIMetricItem } from '../../types/dashboard-types';

interface KPICardsGridProps {
  kpis: KPIMetricItem[];
  isLoading?: boolean;
}

export function KPICardsGrid({ kpis, isLoading = false }: KPICardsGridProps) {
  const iconMap: Record<string, React.ReactNode> = {
    Users: <Users className="h-5 w-5 text-blue-500" />,
    UserCheck: <UserCheck className="h-5 w-5 text-emerald-500" />,
    UserPlus: <UserPlus className="h-5 w-5 text-purple-500" />,
    CheckCircle2: <CheckCircle2 className="h-5 w-5 text-indigo-500" />,
    Trophy: <Trophy className="h-5 w-5 text-amber-500" />,
    TrendingUp: <TrendingUp className="h-5 w-5 text-emerald-500" />,
    DollarSign: <DollarSign className="h-5 w-5 text-teal-500" />,
    Sparkles: <Sparkles className="h-5 w-5 text-pink-500" />,
  };

  const bgMap: Record<string, string> = {
    Users: 'bg-blue-500/10 border-blue-500/20',
    UserCheck: 'bg-emerald-500/10 border-emerald-500/20',
    UserPlus: 'bg-purple-500/10 border-purple-500/20',
    CheckCircle2: 'bg-indigo-500/10 border-indigo-500/20',
    Trophy: 'bg-amber-500/10 border-amber-500/20',
    TrendingUp: 'bg-emerald-500/10 border-emerald-500/20',
    DollarSign: 'bg-teal-500/10 border-teal-500/20',
    Sparkles: 'bg-pink-500/10 border-pink-500/20',
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-muted/40 h-28 rounded-xl border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      {kpis.map((kpi) => {
        const isUp = kpi.trend === 'up';
        const isDown = kpi.trend === 'down';

        return (
          <Card key={kpi.id} className="group border-border shadow-subtle hover:border-border/80 hover:shadow-subtle-hover transition-all duration-200 ease-out">
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  {kpi.title}
                </span>

                <div className={`p-2 rounded-xl border card-hover-icon ${bgMap[kpi.iconName] || 'bg-primary/10 border-primary/20'}`}>
                  {iconMap[kpi.iconName] || <Users className="h-5 w-5 text-primary" />}
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-foreground font-mono">
                  {kpi.formattedValue || kpi.value}
                </span>

                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0.5 font-semibold gap-0.5 ${
                    isUp
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : isDown
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isUp && <ArrowUpRight className="h-3 w-3 shrink-0" />}
                  {isDown && <ArrowDownRight className="h-3 w-3 shrink-0" />}
                  {!isUp && !isDown && <Minus className="h-3 w-3 shrink-0" />}
                  <span>{kpi.percentageChange > 0 ? `+${kpi.percentageChange}%` : `${kpi.percentageChange}%`}</span>
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground truncate">{kpi.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
