'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InventoryItemRecord, StockMovementType } from '../types/inventory-types';
import { stockMovementCreateSchema } from '../schemas/inventory-schemas';
import { Loader2, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItemRecord | null;
  onRecorded: () => void;
}

export function StockMovementDialog({
  open,
  onOpenChange,
  item,
  onRecorded,
}: StockMovementDialogProps) {
  const [type, setType] = React.useState<StockMovementType>('STOCK_IN');
  const [quantity, setQuantity] = React.useState('1');
  const [reason, setReason] = React.useState('');

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setType('STOCK_IN');
    setQuantity('1');
    setReason('');
    setErrors({});
    setApiError(null);
  }, [item, open]);

  if (!item) return null;

  const currentStock = item.currentStock;
  const numQty = parseInt(quantity, 10) || 0;

  // Calculate projected stock based on type
  let projectedStock = currentStock;
  if (type === 'STOCK_IN') {
    projectedStock = currentStock + numQty;
  } else if (type === 'STOCK_OUT') {
    projectedStock = currentStock - numQty;
  } else if (type === 'ADJUSTMENT') {
    projectedStock = currentStock + numQty;
  }

  const isExcessiveStockOut = type === 'STOCK_OUT' && numQty > currentStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    if (numQty <= 0) {
      setErrors({ quantity: 'Quantity must be greater than 0' });
      return;
    }

    if (isExcessiveStockOut) {
      setErrors({
        quantity: `Cannot remove ${numQty} units. Only ${currentStock} units available.`,
      });
      return;
    }

    const payload = {
      type,
      quantity: numQty,
      reason: reason.trim() || null,
    };

    const validation = stockMovementCreateSchema.safeParse(payload);
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
      const res = await fetch(`/api/inventory/items/${item.id}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record stock movement.');
      }

      onOpenChange(false);
      onRecorded();
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
      title="Record Stock Movement"
      description={`Log inventory inflow, outflow, or audit adjustment for ${item.name} (${item.sku}).`}
    >
      {apiError && (
        <div className="p-3 mb-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded text-xs">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Movement Type Toggle */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-muted/50 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setType('STOCK_IN')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium text-xs transition-all ${
              type === 'STOCK_IN'
                ? 'bg-background shadow-xs text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownCircle className="h-3.5 w-3.5" />
            Stock In
          </button>
          <button
            type="button"
            onClick={() => setType('STOCK_OUT')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium text-xs transition-all ${
              type === 'STOCK_OUT'
                ? 'bg-background shadow-xs text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpCircle className="h-3.5 w-3.5" />
            Stock Out
          </button>
          <button
            type="button"
            onClick={() => setType('ADJUSTMENT')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium text-xs transition-all ${
              type === 'ADJUSTMENT'
                ? 'bg-background shadow-xs text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Adjustment
          </button>
        </div>

        {/* Current vs Projected Stock Banner */}
        <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-lg text-xs font-mono">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Current Stock</span>
            <span className="text-sm font-bold text-foreground">
              {currentStock} {item.unit}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase block">Projected Stock</span>
            <span
              className={`text-sm font-bold ${
                projectedStock < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : projectedStock <= (item.reorderThreshold || 0)
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {projectedStock} {item.unit}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">
            Quantity <span className="text-rose-500">*</span>
          </label>
          <Input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-8 text-xs font-mono"
          />
          {errors.quantity && (
            <p className="text-[10px] text-rose-500 font-medium">{errors.quantity}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">
            Reason / Reference
          </label>
          <Input
            placeholder={
              type === 'STOCK_IN'
                ? 'e.g. PO-8492 received from vendor'
                : type === 'STOCK_OUT'
                ? 'e.g. Client order dispatch, damaged unit'
                : 'e.g. Warehouse monthly cycle count'
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-8 text-xs"
          />
          {errors.reason && <p className="text-[10px] text-rose-500">{errors.reason}</p>}
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
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || isExcessiveStockOut}
            className={
              type === 'STOCK_IN'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : type === 'STOCK_OUT'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : ''
            }
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Record {type === 'STOCK_IN' ? 'Inflow' : type === 'STOCK_OUT' ? 'Outflow' : 'Adjustment'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
