'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { InventoryItemRecord } from '../types/inventory-types';
import {
  MoreVertical,
  Eye,
  Edit2,
  ArrowDownUp,
  AlertTriangle,
  Power,
  PackageX,
} from 'lucide-react';

interface InventoryTableProps {
  items: InventoryItemRecord[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit?: (item: InventoryItemRecord) => void;
  onRecordMovement?: (item: InventoryItemRecord) => void;
  onToggleActive?: (item: InventoryItemRecord) => void;
}

export function InventoryTable({
  items,
  isLoading,
  isAdmin,
  onEdit,
  onRecordMovement,
  onToggleActive,
}: InventoryTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-card border border-border rounded-lg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading inventory catalog...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-lg">
        <PackageX className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No inventory items found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No catalog items matched the selected filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-xs py-3.5">SKU</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Item Name</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 hidden md:table-cell">Category</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 text-right">Stock Level</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 text-right hidden sm:table-cell">Cost Price</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 text-right hidden sm:table-cell">Sell Price</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Status</TableHead>
              <TableHead className="w-12 text-right py-3.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {items.map((item) => {
              const isLow = item.isLowStock;
              const isOutOfStock = item.currentStock <= 0;

              const menuItems: DropdownMenuItem[] = [
                {
                  label: 'View Ledger',
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => router.push(`/inventory/${item.id}`),
                },
              ];

              if (isAdmin && onRecordMovement && item.isActive) {
                menuItems.push({
                  label: 'Record Movement',
                  icon: <ArrowDownUp className="h-3.5 w-3.5" />,
                  onClick: () => onRecordMovement(item),
                });
              }

              if (isAdmin && onEdit) {
                menuItems.push({
                  label: 'Edit Item',
                  icon: <Edit2 className="h-3.5 w-3.5" />,
                  onClick: () => onEdit(item),
                });
              }

              if (isAdmin && onToggleActive) {
                menuItems.push({
                  label: item.isActive ? 'Deactivate Item' : 'Reactivate Item',
                  icon: <Power className="h-3.5 w-3.5" />,
                  destructive: item.isActive,
                  onClick: () => onToggleActive(item),
                });
              }

              return (
                <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="py-3 font-mono font-bold text-xs text-primary">
                    <Link
                      href={`/inventory/${item.id}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      {item.sku}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <Link
                        href={`/inventory/${item.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors text-xs"
                      >
                        {item.name}
                      </Link>
                      {item.description && (
                        <span className="text-[11px] text-muted-foreground truncate max-w-xs block">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {item.category || 'General'}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-mono text-xs">
                      {isLow && (
                        <span
                          className="inline-flex items-center text-rose-500"
                          title={`Low Stock! Threshold: ${item.reorderThreshold}`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span
                        className={`font-bold ${
                          isOutOfStock
                            ? 'text-rose-600 dark:text-rose-400'
                            : isLow
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-foreground'
                        }`}
                      >
                        {item.currentStock}
                      </span>
                      <span className="text-muted-foreground text-[11px]">{item.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right text-xs font-mono text-muted-foreground hidden sm:table-cell">
                    ${item.costPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="py-3 text-right text-xs font-mono font-semibold text-foreground hidden sm:table-cell">
                    ${item.sellPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="py-3">
                    {item.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                      items={menuItems}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
