import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  change,
  trend = 'neutral',
  description,
  icon,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn('overflow-hidden transition-all hover:border-border/80', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          {icon && <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-primary">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
          {change && (
            <div
              className={cn(
                'flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
                trend === 'up' && 'bg-success/15 text-success',
                trend === 'down' && 'bg-destructive/15 text-destructive',
                trend === 'neutral' && 'bg-muted text-muted-foreground',
              )}
            >
              {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
