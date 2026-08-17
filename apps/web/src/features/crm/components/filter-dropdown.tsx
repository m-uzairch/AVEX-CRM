'use client';

import * as React from 'react';
import { Filter, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterDropdownProps {
  label?: string;
  options?: FilterOption[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function FilterDropdown({
  label = 'Filter',
  options = [
    { id: 'all', label: 'All Records' },
    { id: 'active', label: 'Active Only' },
    { id: 'pending', label: 'Pending Action' },
    { id: 'archived', label: 'Archived' },
  ],
  selectedId = 'all',
  onSelect,
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(selectedId);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const activeOption = options.find((opt) => opt.id === (onSelect ? selectedId : selected));

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (id: string) => {
    setSelected(id);
    if (onSelect) onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 text-xs flex items-center space-x-2 border-border"
        type="button"
        aria-expanded={isOpen}
      >
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{activeOption ? activeOption.label : label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-md border border-border bg-card shadow-lg py-1 text-xs">
          <div className="px-3 py-1.5 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
            Filter View
          </div>
          {options.map((opt) => {
            const isSelected = (onSelect ? selectedId : selected) === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt.id)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-accent transition-colors',
                  isSelected ? 'font-semibold text-primary' : 'text-foreground'
                )}
                type="button"
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
