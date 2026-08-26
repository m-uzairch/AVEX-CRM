'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { InventoryTable } from '@/features/inventory/components/inventory-table';
import { InventoryItemDialog } from '@/features/inventory/components/inventory-item-dialog';
import { StockMovementDialog } from '@/features/inventory/components/stock-movement-dialog';
import { InventoryItemRecord } from '@/features/inventory/types/inventory-types';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { UserRole } from '@/features/rbac/types/rbac-types';
import {
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export default function InventoryPage() {
  const user = useAuthStore((state) => state.user);
  const role = (user?.role as UserRole) || 'COMPANY_OWNER';
  const isAdmin = role === 'COMPANY_OWNER' || role === 'ADMIN';

  const [items, setItems] = React.useState<InventoryItemRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [lowStockCount, setLowStockCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);

  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('ALL');
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('ALL'); // ALL, ACTIVE, INACTIVE

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItemRecord | null>(null);
  const [movementItem, setMovementItem] = React.useState<InventoryItemRecord | null>(null);

  const fetchItems = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category !== 'ALL') params.set('category', category);
      if (lowStockOnly) params.set('lowStockOnly', 'true');
      if (statusFilter === 'ACTIVE') params.set('isActive', 'true');
      if (statusFilter === 'INACTIVE') params.set('isActive', 'false');
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await fetch(`/api/inventory/items?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch inventory catalog.');
      }

      setItems(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setLowStockCount(data.lowStockCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, lowStockOnly, statusFilter, page, pageSize]);

  React.useEffect(() => {
    if (isAdmin) {
      fetchItems();
    } else {
      setIsLoading(false);
    }
  }, [fetchItems, isAdmin]);

  const handleToggleActive = async (item: InventoryItemRecord) => {
    try {
      const res = await fetch(`/api/inventory/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Failed to toggle item status:', err);
    }
  };

  if (!isAdmin) {
    return (
      <ContentContainer>
        <PageHeader
          title="Inventory Management"
          description="Manage product catalog, stock levels, and warehouse ledger."
          breadcrumbs={[{ label: 'Inventory' }]}
        />
        <div className="p-8 border border-border rounded-lg bg-card text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 w-fit mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Access Restricted</h3>
            <p className="text-xs text-muted-foreground">
              Inventory management and stock ledger access is restricted to administrators and warehouse managers.
            </p>
          </div>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Inventory & Stock Management"
        description="Track product catalog, stock movements, low-stock warnings, and warehouse inventory."
        breadcrumbs={[{ label: 'Inventory' }]}
        actions={
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 text-xs shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        }
      />

      <div className="space-y-4">
        {/* KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 border border-border/80 bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Total Catalog</span>
            <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">{total}</span>
          </Card>
          <Card className="p-3.5 border border-border/80 bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Active Products</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {items.filter((i) => i.isActive).length}
            </span>
          </Card>
          <Card
            className={`p-3.5 border shadow-xs cursor-pointer transition-all ${
              lowStockCount > 0
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-border/80 bg-card'
            }`}
            onClick={() => {
              setLowStockOnly(!lowStockOnly);
              setPage(1);
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Low Stock Alerts</span>
              {lowStockCount > 0 && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            </div>
            <span
              className={`text-xl font-bold font-mono mt-0.5 block ${
                lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
              }`}
            >
              {lowStockCount}
            </span>
          </Card>
          <Card className="p-3.5 border border-border/80 bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Out of Stock</span>
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 block">
              {items.filter((i) => i.currentStock <= 0).length}
            </span>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by SKU, product name, or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Low-stock filter toggle */}
            <Button
              variant={lowStockOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setLowStockOnly(!lowStockOnly);
                setPage(1);
              }}
              className="h-8 text-xs gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Low Stock Only
            </Button>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Categories</option>
              <option value="Hardware">Hardware</option>
              <option value="Electronics">Electronics</option>
              <option value="Office">Office Supplies</option>
              <option value="Peripherals">Peripherals</option>
              <option value="Furniture">Furniture</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by item status"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Items</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchItems()}
              className="h-8 w-8 p-0"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Inventory Table */}
        <InventoryTable
          items={items}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onEdit={(item) => setEditingItem(item)}
          onRecordMovement={(item) => setMovementItem(item)}
          onToggleActive={handleToggleActive}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} items
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddOpen && (
        <InventoryItemDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSaved={fetchItems}
        />
      )}

      {editingItem && (
        <InventoryItemDialog
          open={Boolean(editingItem)}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onSaved={fetchItems}
        />
      )}

      {movementItem && (
        <StockMovementDialog
          open={Boolean(movementItem)}
          onOpenChange={(open) => !open && setMovementItem(null)}
          item={movementItem}
          onRecorded={fetchItems}
        />
      )}
    </ContentContainer>
  );
}
