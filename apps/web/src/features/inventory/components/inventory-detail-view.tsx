'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InventoryItemDetailResponse } from '../types/inventory-types';
import {
  ArrowLeft,
  ArrowDownUp,
  Edit2,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from 'lucide-react';
import { StockMovementDialog } from './stock-movement-dialog';
import { InventoryItemDialog } from './inventory-item-dialog';

interface InventoryDetailViewProps {
  detail: InventoryItemDetailResponse;
  isAdmin: boolean;
  onRefresh: () => void;
}

export function InventoryDetailView({
  detail,
  isAdmin,
  onRefresh,
}: InventoryDetailViewProps) {
  const { item, movements, totalMovements } = detail;
  const [isMovementOpen, setIsMovementOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const isLowStock = item.isLowStock;
  const isOutOfStock = item.currentStock <= 0;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/inventory">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Catalog
            </Button>
          </Link>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Item
            </Button>
            <Button
              size="sm"
              onClick={() => setIsMovementOpen(true)}
              disabled={!item.isActive}
              className="gap-1.5 text-xs"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              Record Stock Movement
            </Button>
          </div>
        )}
      </div>

      {/* Low-Stock Warning Alert */}
      {isLowStock && item.isActive && (
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Low Stock Alert</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Current stock level ({item.currentStock} {item.unit}) is at or below the designated reorder threshold ({item.reorderThreshold} {item.unit}).
            </p>
          </div>
        </div>
      )}

      {/* Item Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border/80 shadow-sm p-4">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Current Stock</span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono ${
                  isOutOfStock
                    ? 'text-rose-600 dark:text-rose-400'
                    : isLowStock
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-foreground'
                }`}
              >
                {item.currentStock}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{item.unit}</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              Reorder at: {item.reorderThreshold ?? 'None'} {item.unit}
            </p>
          </div>
        </Card>

        <Card className="border border-border/80 shadow-sm p-4">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">SKU Code</span>
            <span className="text-xl font-bold font-mono text-primary block">{item.sku}</span>
            <p className="text-[11px] text-muted-foreground">Category: {item.category || 'General'}</p>
          </div>
        </Card>

        <Card className="border border-border/80 shadow-sm p-4">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Cost Price</span>
            <span className="text-xl font-bold font-mono text-foreground block">
              ${item.costPrice.toFixed(2)}
            </span>
            <p className="text-[11px] text-muted-foreground">Per {item.unit}</p>
          </div>
        </Card>

        <Card className="border border-border/80 shadow-sm p-4">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Sell Price</span>
            <span className="text-xl font-bold font-mono text-foreground block">
              ${item.sellPrice.toFixed(2)}
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
              Margin: ${(item.sellPrice - item.costPrice).toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Description Card if present */}
      {item.description && (
        <Card className="border border-border/80 shadow-sm p-4">
          <h4 className="text-xs font-semibold text-foreground mb-1">Description & Specifications</h4>
          <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
            {item.description}
          </p>
        </Card>
      )}

      {/* Stock Movement Ledger Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4 text-primary" />
                Stock Movement Ledger
              </CardTitle>
              <CardDescription className="text-xs">
                Audited transaction log of all stock inflows, outflows, and adjustments for this item.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalMovements} {totalMovements === 1 ? 'record' : 'records'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {movements.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No stock movements recorded for this item yet. Record your initial stock receipt.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold text-xs py-3">Timestamp</TableHead>
                    <TableHead className="font-semibold text-xs py-3">Movement Type</TableHead>
                    <TableHead className="font-semibold text-xs py-3 text-right">Quantity</TableHead>
                    <TableHead className="font-semibold text-xs py-3">Reason / Reference</TableHead>
                    <TableHead className="font-semibold text-xs py-3 hidden sm:table-cell">Recorded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40 font-mono text-xs">
                  {movements.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="py-3 text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3">
                        {m.type === 'STOCK_IN' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <ArrowDownCircle className="h-3 w-3" />
                            Stock In
                          </span>
                        ) : m.type === 'STOCK_OUT' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            <ArrowUpCircle className="h-3 w-3" />
                            Stock Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            <RefreshCw className="h-3 w-3" />
                            Adjustment
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-right font-bold">
                        <span
                          className={
                            m.type === 'STOCK_IN'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : m.type === 'STOCK_OUT'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-primary'
                          }
                        >
                          {m.type === 'STOCK_IN' ? `+${m.quantity}` : m.type === 'STOCK_OUT' ? `-${m.quantity}` : `${m.quantity}`}
                        </span>{' '}
                        <span className="text-muted-foreground font-normal text-[11px]">{item.unit}</span>
                      </TableCell>
                      <TableCell className="py-3 font-sans text-muted-foreground">
                        {m.reason || '—'}
                      </TableCell>
                      <TableCell className="py-3 font-sans text-muted-foreground hidden sm:table-cell">
                        {m.performedByUser ? m.performedByUser.fullName : 'System'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movement Modal */}
      {isMovementOpen && (
        <StockMovementDialog
          open={isMovementOpen}
          onOpenChange={setIsMovementOpen}
          item={item}
          onRecorded={onRefresh}
        />
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <InventoryItemDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          item={item}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}
