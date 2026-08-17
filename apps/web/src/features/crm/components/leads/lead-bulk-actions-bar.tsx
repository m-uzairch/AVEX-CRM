'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tag,
  Archive,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { LeadBulkActionType, LeadStatus, LeadPriority } from '../../types/lead-types';

interface LeadBulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExecuteAction: (
    action: LeadBulkActionType,
    payload?: {
      assignedEmployeeId?: string;
      status?: LeadStatus;
      priority?: LeadPriority;
      tags?: string[];
    }
  ) => void;
}

export function LeadBulkActionsBar({
  selectedCount,
  onClearSelection,
  onExecuteAction,
}: LeadBulkActionsBarProps) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<LeadStatus>('QUALIFIED');
  const [selectedPriority, setSelectedPriority] = React.useState<LeadPriority>('HIGH');
  const [tagInput, setTagInput] = React.useState('');

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border shadow-2xl rounded-full px-5 py-2.5 text-xs text-card-foreground animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center space-x-2 font-semibold border-r border-border/80 pr-3">
        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px]">
          {selectedCount}
        </span>
        <span>selected</span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Change Status */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setActiveDialog(activeDialog === 'status' ? null : 'status')}
          >
            <span>Status</span>
          </Button>

          {activeDialog === 'status' && (
            <div className="absolute bottom-10 left-0 bg-popover border border-border p-3 rounded-lg shadow-lg w-48 space-y-2 z-50">
              <p className="font-semibold text-popover-foreground text-[11px]">Change Status</p>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                className="w-full text-xs p-1.5 rounded border border-input bg-background"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL_SENT">Proposal Sent</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="WON">Won (Converted)</option>
                <option value="LOST">Lost</option>
              </select>
              <div className="flex justify-end gap-1 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[11px]"
                  onClick={() => setActiveDialog(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-[11px]"
                  onClick={() => {
                    onExecuteAction('CHANGE_STATUS', { status: selectedStatus });
                    setActiveDialog(null);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Change Priority */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setActiveDialog(activeDialog === 'priority' ? null : 'priority')}
          >
            <span>Priority</span>
          </Button>

          {activeDialog === 'priority' && (
            <div className="absolute bottom-10 left-0 bg-popover border border-border p-3 rounded-lg shadow-lg w-44 space-y-2 z-50">
              <p className="font-semibold text-popover-foreground text-[11px]">Change Priority</p>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as LeadPriority)}
                className="w-full text-xs p-1.5 rounded border border-input bg-background"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <div className="flex justify-end gap-1 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[11px]"
                  onClick={() => setActiveDialog(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-[11px]"
                  onClick={() => {
                    onExecuteAction('CHANGE_PRIORITY', { priority: selectedPriority });
                    setActiveDialog(null);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setActiveDialog(activeDialog === 'tags' ? null : 'tags')}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Tags</span>
          </Button>

          {activeDialog === 'tags' && (
            <div className="absolute bottom-10 left-0 bg-popover border border-border p-3 rounded-lg shadow-lg w-56 space-y-2 z-50">
              <p className="font-semibold text-popover-foreground text-[11px]">Add Tags (comma separated)</p>
              <input
                type="text"
                placeholder="e.g. Enterprise, Urgent"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full text-xs p-1.5 rounded border border-input bg-background"
              />
              <div className="flex justify-end gap-1 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[11px]"
                  onClick={() => setActiveDialog(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-[11px]"
                  onClick={() => {
                    const tagList = tagInput
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);
                    if (tagList.length > 0) {
                      onExecuteAction('ADD_TAGS', { tags: tagList });
                    }
                    setActiveDialog(null);
                    setTagInput('');
                  }}
                >
                  Add Tags
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Archive */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => onExecuteAction('ARCHIVE')}
        >
          <Archive className="h-3.5 w-3.5" />
          <span>Archive</span>
        </Button>

        {/* Restore */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 text-emerald-600 hover:text-emerald-700"
          onClick={() => onExecuteAction('RESTORE')}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restore</span>
        </Button>

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => {
            if (confirm(`Are you sure you want to delete ${selectedCount} selected leads?`)) {
              onExecuteAction('DELETE');
            }
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 ml-2 rounded-full text-muted-foreground hover:text-foreground"
        onClick={onClearSelection}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
