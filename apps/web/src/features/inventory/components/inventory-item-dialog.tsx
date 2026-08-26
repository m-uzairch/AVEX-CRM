'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InventoryItemRecord } from '../types/inventory-types';
import { inventoryItemCreateSchema } from '../schemas/inventory-schemas';
import { Loader2 } from 'lucide-react';

interface InventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItemRecord | null;
  onSaved: () => void;
}

export function InventoryItemDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: InventoryItemDialogProps) {
  const isEditing = Boolean(item);

  const [sku, setSku] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [unit, setUnit] = React.useState('pcs');
  const [costPrice, setCostPrice] = React.useState('0');
  const [sellPrice, setSellPrice] = React.useState('0');
  const [reorderThreshold, setReorderThreshold] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (item) {
      setSku(item.sku);
      setName(item.name);
      setDescription(item.description || '');
      setCategory(item.category || '');
      setUnit(item.unit || 'pcs');
      setCostPrice(String(item.costPrice));
      setSellPrice(String(item.sellPrice));
      setReorderThreshold(item.reorderThreshold !== null ? String(item.reorderThreshold) : '');
      setIsActive(item.isActive);
    } else {
      setSku('');
      setName('');
      setDescription('');
      setCategory('');
      setUnit('pcs');
      setCostPrice('0');
      setSellPrice('0');
      setReorderThreshold('10');
      setIsActive(true);
    }
    setErrors({});
    setApiError(null);
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    const payload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      unit: unit.trim() || 'pcs',
      costPrice: parseFloat(costPrice) || 0,
      sellPrice: parseFloat(sellPrice) || 0,
      reorderThreshold: reorderThreshold ? parseInt(reorderThreshold, 10) : null,
      isActive,
    };

    const validation = inventoryItemCreateSchema.safeParse(payload);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errMap[String(err.path[0])] = err.message;
        }
      });
      setErrors(errMap);
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isEditing ? `/api/inventory/items/${item?.id}` : '/api/inventory/items';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save inventory item.');
      }

      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? 'Edit Inventory Item' : 'New Catalog Item'}
      description={
        isEditing
          ? 'Update catalog specifications, pricing, or alert threshold.'
          : 'Add an inventory item to your company catalog. Stock movements are tracked separately.'
      }
    >
      {apiError && (
        <div className="p-3 mb-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded text-xs">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">
              SKU (Product Code) <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. PRD-1001"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="h-8 text-xs font-mono uppercase"
            />
            {errors.sku && <p className="text-[10px] text-rose-500">{errors.sku}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">
              Unit of Measure <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. pcs, kg, box"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-8 text-xs"
            />
            {errors.unit && <p className="text-[10px] text-rose-500">{errors.unit}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">
            Item Name <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="e.g. MacBook Pro M3 Max"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-xs"
          />
          {errors.name && <p className="text-[10px] text-rose-500">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">Category</label>
            <Input
              placeholder="e.g. Hardware, Office"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">
              Reorder Threshold (Alert)
            </label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 5"
              value={reorderThreshold}
              onChange={(e) => setReorderThreshold(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">Cost Price ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-foreground">Sell Price ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">Description</label>
          <Textarea
            placeholder="Detailed specifications, model number, supplier notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-16 text-xs resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
