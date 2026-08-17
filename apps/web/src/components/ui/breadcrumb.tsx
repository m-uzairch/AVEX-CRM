import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center text-xs text-muted-foreground', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5">
        {showHome && (
          <li className="flex items-center">
            <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {items.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-1.5">
            {(showHome || idx > 0) && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
