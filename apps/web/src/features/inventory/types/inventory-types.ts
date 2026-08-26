export type StockMovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export interface InventoryItemRecord {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  costPrice: number;
  sellPrice: number;
  reorderThreshold: number | null;
  currentStock: number;
  isLowStock: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStockMovementRecord {
  id: string;
  companyId: string;
  itemId: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  performedByUserId: string | null;
  createdAt: string;
  performedByUser?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface InventoryFilterParams {
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RecordStockMovementInput {
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
}

export interface PaginatedInventoryItemsResponse {
  data: InventoryItemRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lowStockCount: number;
}

export interface PaginatedMovementsResponse {
  data: InventoryStockMovementRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryItemDetailResponse {
  item: InventoryItemRecord;
  movements: InventoryStockMovementRecord[];
  totalMovements: number;
}
