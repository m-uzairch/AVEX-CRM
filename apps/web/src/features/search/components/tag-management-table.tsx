'use client';

import * as React from 'react';
import { Tag } from '../types/search-types';
import { Button } from '@/components/ui/button';
import { Tag as TagIcon, Edit, Trash2, Plus, Check } from 'lucide-react';
import { createTag, updateTag, deleteTag } from '../services/search-service';

interface TagManagementTableProps {
  tags: Tag[];
  onRefresh: () => void;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

export function TagManagementTable({ tags, onRefresh }: TagManagementTableProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null);

  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState('#3B82F6');
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleOpenCreate = () => {
    setEditingTag(null);
    setName('');
    setColor('#3B82F6');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setColor(tag.color);
    setDescription(tag.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingTag) {
        await updateTag(editingTag.id, { name, color, description });
      } else {
        await createTag({ name, color, description });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to save tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (confirm(`Are you sure you want to delete tag #${tag.name}?`)) {
      await deleteTag(tag.id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-foreground">Workspace Smart Tags ({tags.length})</h3>
          <p className="text-muted-foreground text-[11px]">
            Manage color-coded tags used across leads and customer records.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} className="gap-1 text-xs">
          <Plus className="h-4 w-4" />
          <span>New Tag</span>
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th className="p-3">Tag Name & Badge</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-center">Tagged Records</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-medium">
            {tags.map((tag) => (
              <tr key={tag.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <span
                    style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}40` }}
                    className="inline-flex items-center text-xs font-extrabold px-2.5 py-1 rounded-full border"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    #{tag.name}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{tag.description || '—'}</td>
                <td className="p-3 text-center font-bold text-foreground">
                  {tag.usageCount || 0}
                </td>
                <td className="p-3 text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => handleOpenEdit(tag)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(tag)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border p-5 rounded-xl shadow-2xl max-w-sm w-full space-y-4 text-card-foreground text-xs"
          >
            <h3 className="font-bold text-sm text-foreground">
              {editingTag ? `Edit Tag #${editingTag.name}` : 'Create Smart Tag'}
            </h3>

            <div>
              <label className="font-semibold block mb-1">Tag Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise, VIP, Hot Prospect"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-input bg-background"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Badge Hex Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-10 p-0 border border-input rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background font-mono"
                />
              </div>

              {/* Color Presets */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {defaultColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    className="h-5 w-5 rounded-full border border-border flex items-center justify-center"
                  >
                    {color.toUpperCase() === c.toUpperCase() && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Internal tag usage notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-input bg-background"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Tag'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
