'use client';

import * as React from 'react';
import {
  X,
  Filter,
  Bookmark,
  Plus,
  Check,
  RotateCcw,
  Tag as TagIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdvancedFilterState, SavedFilter, Tag } from '../types/search-types';
import {
  fetchSavedFilters,
  createSavedFilter,
  deleteSavedFilter,
  fetchTags,
} from '../services/search-service';

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  module?: 'LEADS' | 'CUSTOMERS' | 'ALL';
  onClose: () => void;
  filters: AdvancedFilterState;
  onApplyFilters: (filters: AdvancedFilterState) => void;
  onResetFilters: () => void;
}

export function AdvancedFilterPanel({
  isOpen,
  module = 'ALL',
  onClose,
  filters: initialFilters,
  onApplyFilters,
  onResetFilters,
}: AdvancedFilterPanelProps) {
  const [localFilters, setLocalFilters] = React.useState<AdvancedFilterState>(initialFilters);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [savedPresets, setSavedPresets] = React.useState<SavedFilter[]>([]);

  const [newPresetName, setNewPresetName] = React.useState('');
  const [isSavingPreset, setIsSavingPreset] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters(initialFilters);
      fetchTags().then(setTags).catch(() => setTags([]));
      fetchSavedFilters(module).then(setSavedPresets).catch(() => setSavedPresets([]));
    }
  }, [isOpen, initialFilters, module]);

  if (!isOpen) return null;

  const handleChange = (key: keyof AdvancedFilterState, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleTag = (tagName: string) => {
    const current = localFilters.tags || [];
    const updated = current.includes(tagName)
      ? current.filter((t) => t !== tagName)
      : [...current, tagName];
    handleChange('tags', updated);
  };

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    try {
      setIsSavingPreset(true);
      const newFilter = await createSavedFilter({
        name: newPresetName.trim(),
        module,
        filterConfig: localFilters as Record<string, any>,
      });
      setSavedPresets((prev) => [newFilter, ...prev]);
      setNewPresetName('');
    } catch (err: any) {
      alert(err?.message || 'Failed to save filter preset');
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await deleteSavedFilter(presetId);
      setSavedPresets((prev) => prev.filter((p) => p.id !== presetId));
    } catch {
      alert('Failed to delete preset');
    }
  };

  const handleApplyPreset = (preset: SavedFilter) => {
    setLocalFilters(preset.filterConfig as AdvancedFilterState);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col text-card-foreground text-xs">
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Advanced Search Filters</h2>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Saved Filter Presets Bar */}
            <div className="space-y-2 bg-muted/40 p-3 rounded-xl border border-border">
              <span className="font-bold text-foreground flex items-center space-x-1">
                <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                <span>Saved Presets</span>
              </span>

              {savedPresets.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">No saved filter presets yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-card border border-border text-[11px]"
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {preset.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="text-muted-foreground hover:text-destructive p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Save current filter form */}
              <form onSubmit={handleSavePreset} className="flex items-center space-x-1.5 pt-2 border-t border-border/60">
                <input
                  type="text"
                  placeholder="Preset name (e.g. VIP Leads)..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="flex-1 text-[11px] px-2 py-1 rounded border border-input bg-background"
                />
                <Button type="submit" size="sm" disabled={isSavingPreset || !newPresetName.trim()} className="h-7 text-[11px]">
                  <Plus className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </form>
            </div>

            {/* Filter Controls Form */}
            <div className="space-y-4">
              {/* Priority */}
              <div>
                <label className="font-bold text-foreground block mb-1">Priority</label>
                <select
                  value={localFilters.priority || 'ALL'}
                  onChange={(e) => handleChange('priority', e.target.value === 'ALL' ? undefined : e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="font-bold text-foreground block mb-1">Status</label>
                <select
                  value={localFilters.status || 'ALL'}
                  onChange={(e) => handleChange('status', e.target.value === 'ALL' ? undefined : e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Won (Converted)</option>
                  <option value="LOST">Lost</option>
                  <option value="ACTIVE">Active Customer</option>
                </select>
              </div>

              {/* Tags Multi-select */}
              <div>
                <label className="font-bold text-foreground block mb-1 flex items-center justify-between">
                  <span>Smart Tags</span>
                  <TagIcon className="h-3 w-3 text-muted-foreground" />
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => {
                    const isSelected = (localFilters.tags || []).includes(tag.name);
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
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all"
                      >
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Score Range (for leads) */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                <div>
                  <label className="font-bold text-foreground block mb-1">Min Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={localFilters.minScore ?? ''}
                    onChange={(e) => handleChange('minScore', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full text-xs p-2 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Max Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    value={localFilters.maxScore ?? ''}
                    onChange={(e) => handleChange('maxScore', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full text-xs p-2 rounded-md border border-input bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onResetFilters} className="text-xs text-muted-foreground gap-1">
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onApplyFilters(localFilters);
                onClose();
              }}
              className="text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
