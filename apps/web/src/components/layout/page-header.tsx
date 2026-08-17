import * as React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between pb-6 border-b border-border">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-2" />}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center space-x-3 pt-2 md:pt-0">{actions}</div>}
    </div>
  );
}
