'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search CRM records...',
  value = '',
  onChange,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(value);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (onChange) onChange(val);
  };

  const handleClear = () => {
    setInternalValue('');
    if (onChange) onChange('');
  };

  return (
    <div className={cn('relative flex-1 max-w-sm', className)}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={onChange ? value : internalValue}
        onChange={handleTextChange}
        className="pl-9 pr-8 h-9 text-xs bg-background border-border"
      />
      {(value || internalValue) && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
