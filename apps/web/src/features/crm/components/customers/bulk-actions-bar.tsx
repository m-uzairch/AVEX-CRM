'use client';

import * as React from 'react';
import { CustomerStatus, BulkActionType } from '../../types/customer-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Archive,
  RotateCcw,
  Tag,
  UserCheck,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkActionsBarProps {
  selectedCount: number;
  isTrashView?: boolean;
  isArchiveView?: boolean;
  onClearSelection: () => void;
  onExecuteAction: (action: BulkActionType, extra?: { targetStatus?: CustomerStatus; tags?: string[] }) => void;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  isTrashView = false,
  isArchiveView = false,
  onClearSelection,
  onExecuteAction,
  className,
}: BulkActionsBarProps) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = React.useState(false);
  const [isTagMenuOpen, setIsTagMenuOpen] = React.useState(false);

  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-3 p-3 px-4 rounded-xl border border-primary/30 bg-card shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-4 duration-200',
        className
      )}
    >
      <div className="flex items-center space-x-2 border-r border-border pr-3">
        <Badge variant="default" className="font-bold text-xs px-2 py-0.5">
          {selectedCount} Selected
        </Badge>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground text-xs p-1"
          title="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Trash View Restore Button */}
        {isTrashView ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExecuteAction('RESTORE')}
            className="h-8 text-xs border-border flex items-center space-x-1"
          >
            <RotateCcw className="h-3.5 w-3.5 text-emerald-500" />
            <span>Restore</span>
          </Button>
        ) : (
          <>
            {/* Change Status Dropdown */}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className="h-8 text-xs border-border flex items-center space-x-1"
              >
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                <span>Change Status</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>

              {isStatusMenuOpen && (
                <div className="absolute bottom-full mb-1 left-0 z-50 w-40 rounded-md border border-border bg-card shadow-lg py-1">
                  {(['ACTIVE', 'PROSPECT', 'INACTIVE', 'LOST', 'BLACKLISTED'] as CustomerStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => {
                          onExecuteAction('CHANGE_STATUS', { targetStatus: st });
                          setIsStatusMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent text-foreground font-medium"
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Archive / Unarchive */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExecuteAction(isArchiveView ? 'UNARCHIVE' : 'ARCHIVE')}
              className="h-8 text-xs border-border flex items-center space-x-1"
            >
              <Archive className="h-3.5 w-3.5 text-amber-500" />
              <span>{isArchiveView ? 'Unarchive' : 'Archive'}</span>
            </Button>

            {/* Bulk Tag Dropdown */}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                className="h-8 text-xs border-border flex items-center space-x-1"
              >
                <Tag className="h-3.5 w-3.5 text-purple-500" />
                <span>Add Tag</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>

              {isTagMenuOpen && (
                <div className="absolute bottom-full mb-1 left-0 z-50 w-40 rounded-md border border-border bg-card shadow-lg py-1">
                  {['VIP', 'High Paying', 'Enterprise', 'Startup', 'Hot Lead'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        onExecuteAction('ADD_TAGS', { tags: [t] });
                        setIsTagMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent text-foreground font-medium"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Soft Delete */}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm(`Move ${selectedCount} selected customers to Trash?`)) {
                  onExecuteAction('DELETE');
                }
              }}
              className="h-8 text-xs flex items-center space-x-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Move to Trash</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
