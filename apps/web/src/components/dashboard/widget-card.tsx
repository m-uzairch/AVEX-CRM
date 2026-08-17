import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface WidgetCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function WidgetCard({
  title,
  description,
  icon,
  action,
  children,
  className,
  contentClassName,
}: WidgetCardProps) {
  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-primary">{icon}</span>}
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className={cn('flex-1 p-6 pt-0', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
