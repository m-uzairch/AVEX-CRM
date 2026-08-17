'use client';

import * as React from 'react';
import { Flame, Snowflake, Sun, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadScoreRange } from '../../types/lead-types';

interface LeadScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function getScoreCategory(score: number): {
  label: string;
  key: LeadScoreRange;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: React.ReactNode;
} {
  if (score >= 76) {
    return {
      label: 'Very Hot',
      key: 'VERY_HOT',
      colorClass: 'text-red-500 dark:text-red-400',
      bgClass: 'bg-red-500/10 dark:bg-red-500/20',
      borderClass: 'border-red-500/30',
      icon: <Flame className="h-3.5 w-3.5 fill-current text-red-500 animate-pulse" />,
    };
  }
  if (score >= 51) {
    return {
      label: 'Hot',
      key: 'HOT',
      colorClass: 'text-orange-500 dark:text-orange-400',
      bgClass: 'bg-orange-500/10 dark:bg-orange-500/20',
      borderClass: 'border-orange-500/30',
      icon: <Sparkles className="h-3.5 w-3.5 text-orange-500" />,
    };
  }
  if (score >= 26) {
    return {
      label: 'Warm',
      key: 'WARM',
      colorClass: 'text-amber-500 dark:text-amber-400',
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderClass: 'border-amber-500/30',
      icon: <Sun className="h-3.5 w-3.5 text-amber-500" />,
    };
  }
  return {
    label: 'Cold',
    key: 'COLD',
    colorClass: 'text-sky-500 dark:text-sky-400',
    bgClass: 'bg-sky-500/10 dark:bg-sky-500/20',
    borderClass: 'border-sky-500/30',
    icon: <Snowflake className="h-3.5 w-3.5 text-sky-500" />,
  };
}

export function LeadScoreBadge({
  score,
  showLabel = true,
  className,
  size = 'md',
}: LeadScoreBadgeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score ?? 50));
  const cat = getScoreCategory(normalizedScore);

  return (
    <div
      className={cn(
        'inline-flex items-center space-x-1.5 rounded-full border px-2.5 py-0.5 font-semibold transition-colors',
        cat.bgClass,
        cat.colorClass,
        cat.borderClass,
        size === 'sm' && 'text-[11px] px-2 py-0.2',
        size === 'lg' && 'text-sm px-3.5 py-1',
        className
      )}
      title={`Score: ${normalizedScore}/100 (${cat.label})`}
    >
      {cat.icon}
      <span className="font-mono font-bold">{normalizedScore}</span>
      {showLabel && <span className="text-[10px] uppercase tracking-wider opacity-80">({cat.label})</span>}
    </div>
  );
}
