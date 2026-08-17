'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend = 'neutral',
  description,
  icon,
  iconBgColor = 'bg-primary/10 text-primary',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('shadow-xs border-border hover:border-border/80 transition-all', className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', iconBgColor)}>
            {icon}
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>

          {change && (
            <div
              className={cn(
                'flex items-center space-x-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
                trend === 'up' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                trend === 'down' && 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                trend === 'neutral' && 'bg-muted text-muted-foreground'
              )}
            >
              {trend === 'up' && <TrendingUp className="h-3 w-3 mr-0.5" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 mr-0.5" />}
              {trend === 'neutral' && <Minus className="h-3 w-3 mr-0.5" />}
              <span>{change}</span>
            </div>
          )}
        </div>

        {description && (
          <p className="mt-1 text-[11px] text-muted-foreground truncate">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
