'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface CRMHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function CRMHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}: CRMHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
      <div className="space-y-1">
        {/* Breadcrumb Trail */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground mb-1.5" aria-label="Breadcrumb">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            <Link href="/crm" className="hover:text-foreground transition-colors">
              CRM
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Action Buttons Slot */}
      {actions && <div className="flex items-center space-x-2 shrink-0">{actions}</div>}
    </div>
  );
}
