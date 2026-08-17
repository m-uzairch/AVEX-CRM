'use client';

import * as React from 'react';
import { Tag } from '../types/search-types';
import { Button } from '@/components/ui/button';
import { Tag as TagIcon, Check } from 'lucide-react';
import { fetchTags, executeBulkTagOperation } from '../services/search-service';

interface BulkTagModalProps {
  isOpen: boolean;
  entityType: 'LEAD' | 'CUSTOMER';
  selectedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkTagModal({
  isOpen,
  entityType,
  selectedIds,
  onClose,
  onSuccess,
}: BulkTagModalProps) {
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [selectedTagNames, setSelectedTagNames] = React.useState<string[]>([]);
  const [action, setAction] = React.useState<'ADD' | 'REMOVE' | 'REPLACE'>('ADD');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchTags().then(setTags).catch(() => setTags([]));
      setSelectedTagNames([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleTag = (tagName: string) => {
    setSelectedTagNames((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTagNames.length === 0) return;

    try {
      setIsSubmitting(true);
      await executeBulkTagOperation({
        entityType,
        entityIds: selectedIds,
        action,
        tags: selectedTagNames,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to execute bulk tag action');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border p-5 rounded-xl shadow-2xl max-w-sm w-full space-y-4 text-card-foreground text-xs animate-in fade-in"
      >
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground flex items-center space-x-1.5">
            <TagIcon className="h-4 w-4 text-primary" />
            <span>Bulk Tag {entityType === 'LEAD' ? 'Leads' : 'Customers'} ({selectedIds.length})</span>
          </h3>
          <p className="text-muted-foreground text-[11px]">
            Apply or remove tags across all {selectedIds.length} selected records.
          </p>
        </div>

        {/* Action Type */}
        <div>
          <label className="font-semibold block mb-1">Bulk Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as any)}
            className="w-full text-xs p-2 rounded-md border border-input bg-background font-semibold"
          >
            <option value="ADD">Add Tags (Append)</option>
            <option value="REMOVE">Remove Selected Tags</option>
            <option value="REPLACE">Replace All Tags</option>
          </select>
        </div>

        {/* Tags Selection */}
        <div>
          <label className="font-semibold block mb-1.5">Select Tags</label>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 border border-border rounded-lg bg-muted/20">
            {tags.map((tag) => {
              const isSelected = selectedTagNames.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.name)}
                  style={{
                    backgroundColor: isSelected ? tag.color : 'transparent',
                    borderColor: tag.color,
                    color: isSelected ? '#FFFFFF' : tag.color,
                  }}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all flex items-center space-x-1"
                >
                  {isSelected && <Check className="h-3 w-3 mr-0.5" />}
                  <span>#{tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting || selectedTagNames.length === 0}>
            {isSubmitting ? 'Applying...' : `Execute ${action}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
