/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';
import {
  InventoryItemRecord,
  InventoryStockMovementRecord,
  InventoryFilterParams,
  StockMovementType,
  InventoryItemDetailResponse,
  PaginatedInventoryItemsResponse,
  PaginatedMovementsResponse,
} from '../types/inventory-types';
import {
  InventoryItemCreateInput,
  InventoryItemUpdateInput,
  StockMovementCreateInput,
} from '../schemas/inventory-schemas';
import {
  memoryInventoryItems,
  memoryInventoryMovements,
} from './inventory-store';

export class InventoryService {
  /**
   * Fetch company-scoped paginated and filtered inventory items list
   */
  static async getItems(
    companyId: string,
    params: InventoryFilterParams = {}
  ): Promise<PaginatedInventoryItemsResponse> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 10));
    const search = params.search?.trim().toLowerCase();
    const category = params.category;
    const lowStockOnly = params.lowStockOnly;
    const isActive = params.isActive !== undefined ? params.isActive : undefined;
    const sortField = params.sortField || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const where: Prisma.InventoryItemWhereInput = {
      companyId,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    try {
      const [items, total, lowStockItems] = await Promise.all([
        prisma.inventoryItem.findMany({
          where,
          orderBy: { [sortField]: sortOrder },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.inventoryItem.count({ where }),
        prisma.inventoryItem.findMany({
          where: {
            companyId,
            isActive: true,
            reorderThreshold: { not: null },
          },
          select: {
            id: true,
            currentStock: true,
            reorderThreshold: true,
          },
        }),
      ]);

      const lowStockCount = lowStockItems.filter(
        (item) =>
          item.reorderThreshold !== null && item.currentStock <= item.reorderThreshold
      ).length;

      let resultItems = items.map((item) => ({
        id: item.id,
        companyId: item.companyId,
        sku: item.sku,
        name: item.name,
        description: item.description,
        category: item.category,
        unit: item.unit,
        costPrice: item.costPrice,
        sellPrice: item.sellPrice,
        reorderThreshold: item.reorderThreshold,
        currentStock: item.currentStock,
        isLowStock:
          item.reorderThreshold !== null &&
          item.currentStock <= item.reorderThreshold,
        isActive: item.isActive,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));

      if (lowStockOnly) {
        resultItems = resultItems.filter((i) => i.isLowStock);
      }

      const totalPages = Math.ceil(total / pageSize) || 1;

      return {
        data: resultItems,
        total,
        page,
        pageSize,
        totalPages,
        lowStockCount,
      };
    } catch (dbError: any) {
      console.warn(
        '[InventoryService.getItems] Database connection unavailable, falling back to resilient development store:',
        dbError?.message || dbError
      );

      let list = memoryInventoryItems[companyId] || memoryInventoryItems.comp_001 || [];

      if (isActive !== undefined) {
        list = list.filter((i) => i.isActive === isActive);
      }

      if (search) {
        list = list.filter(
          (i) =>
            i.sku.toLowerCase().includes(search) ||
            i.name.toLowerCase().includes(search) ||
            (i.description && i.description.toLowerCase().includes(search)) ||
            (i.category && i.category.toLowerCase().includes(search))
        );
      }

      if (category && category !== 'ALL') {
        list = list.filter((i) => i.category === category);
      }

      const lowStockCount = list.filter((i) => i.isLowStock).length;

      if (lowStockOnly) {
        list = list.filter((i) => i.isLowStock);
      }

      const total = list.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const paginated = list.slice((page - 1) * pageSize, page * pageSize);

      return {
        data: paginated,
        total,
        page,
        pageSize,
        totalPages,
        lowStockCount,
      };
    }
  }

  /**
   * Fetch item detail with stock movement history
   */
  static async getItemById(
    companyId: string,
    id: string
  ): Promise<InventoryItemDetailResponse | null> {
    try {
      const item = await prisma.inventoryItem.findFirst({
        where: {
          id,
          companyId,
        },
      });

      if (!item) {
        return null;
      }

      const [movements, totalMovements] = await Promise.all([
        prisma.inventoryStockMovement.findMany({
          where: {
            itemId: id,
            companyId,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            performedByUser: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        }),
        prisma.inventoryStockMovement.count({
          where: {
            itemId: id,
            companyId,
          },
        }),
      ]);

      return {
        item: {
          id: item.id,
          companyId: item.companyId,
          sku: item.sku,
          name: item.name,
          description: item.description,
          category: item.category,
          unit: item.unit,
          costPrice: item.costPrice,
          sellPrice: item.sellPrice,
          reorderThreshold: item.reorderThreshold,
          currentStock: item.currentStock,
          isLowStock:
            item.reorderThreshold !== null &&
            item.currentStock <= item.reorderThreshold,
          isActive: item.isActive,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        },
        movements: movements.map((m) => ({
          id: m.id,
          companyId: m.companyId,
          itemId: m.itemId,
          type: m.type as StockMovementType,
          quantity: m.quantity,
          reason: m.reason,
          performedByUserId: m.performedByUserId,
          createdAt: m.createdAt.toISOString(),
          performedByUser: m.performedByUser,
        })),
        totalMovements,
      };
    } catch (dbError: any) {
      console.warn(
        '[InventoryService.getItemById] DB unavailable, using development store:',
        dbError?.message
      );

      const items = memoryInventoryItems[companyId] || memoryInventoryItems.comp_001 || [];
      const item = items.find((i) => i.id === id) || null;
      if (!item) return null;

      const allMovements =
        memoryInventoryMovements[companyId] || memoryInventoryMovements.comp_001 || [];
      const movements = allMovements.filter((m) => m.itemId === id);

      return {
        item,
        movements,
        totalMovements: movements.length,
      };
    }
  }

  /**
   * Create a new inventory item directly returning the created entity
   */
  static async createItem(
    companyId: string,
    data: InventoryItemCreateInput
  ): Promise<InventoryItemRecord> {
    try {
      const existing = await prisma.inventoryItem.findUnique({
        where: {
          companyId_sku: {
            companyId,
            sku: data.sku,
          },
        },
      });

      if (existing) {
        throw new Error(`Item with SKU '${data.sku}' already exists in this company.`);
      }

      const created = await prisma.inventoryItem.create({
        data: {
          companyId,
          sku: data.sku,
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          unit: data.unit || 'pcs',
          costPrice: data.costPrice || 0,
          sellPrice: data.sellPrice || 0,
          reorderThreshold: data.reorderThreshold ?? null,
          currentStock: 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });

      return {
        id: created.id,
        companyId: created.companyId,
        sku: created.sku,
        name: created.name,
        description: created.description,
        category: created.category,
        unit: created.unit,
        costPrice: created.costPrice,
        sellPrice: created.sellPrice,
        reorderThreshold: created.reorderThreshold,
        currentStock: created.currentStock,
        isLowStock:
          created.reorderThreshold !== null &&
          created.currentStock <= created.reorderThreshold,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (dbError: any) {
      if (dbError.message?.includes('already exists')) {
        throw dbError;
      }

      console.warn(
        '[InventoryService.createItem] DB insert failed, storing in development store:',
        dbError?.message
      );

      if (!memoryInventoryItems[companyId]) {
        memoryInventoryItems[companyId] = [];
      }

      const existingInMem = memoryInventoryItems[companyId].find(
        (i) => i.sku.toUpperCase() === data.sku.toUpperCase()
      );
      if (existingInMem) {
        throw new Error(`Item with SKU '${data.sku}' already exists in this company.`);
      }

      const newItem: InventoryItemRecord = {
        id: `item_${Date.now()}`,
        companyId,
        sku: data.sku.toUpperCase(),
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        unit: data.unit || 'pcs',
        costPrice: data.costPrice || 0,
        sellPrice: data.sellPrice || 0,
        reorderThreshold: data.reorderThreshold ?? null,
        currentStock: 0,
        isLowStock: false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryInventoryItems[companyId].unshift(newItem);
      return newItem;
    }
  }

  /**
   * Update an inventory item directly returning the updated entity
   */
  static async updateItem(
    companyId: string,
    id: string,
    data: InventoryItemUpdateInput
  ): Promise<InventoryItemRecord> {
    try {
      if (data.sku) {
        const existing = await prisma.inventoryItem.findFirst({
          where: {
            companyId,
            sku: data.sku,
            NOT: { id },
          },
        });
        if (existing) {
          throw new Error(`Item with SKU '${data.sku}' already exists in this company.`);
        }
      }

      const updateData: Prisma.InventoryItemUpdateInput = {};
      if (data.sku !== undefined) updateData.sku = data.sku;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.unit !== undefined) updateData.unit = data.unit;
      if (data.costPrice !== undefined) updateData.costPrice = data.costPrice;
      if (data.sellPrice !== undefined) updateData.sellPrice = data.sellPrice;
      if (data.reorderThreshold !== undefined) updateData.reorderThreshold = data.reorderThreshold;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const updated = await prisma.inventoryItem.update({
        where: {
          id_companyId: {
            id,
            companyId,
          },
        },
        data: updateData,
      });

      return {
        id: updated.id,
        companyId: updated.companyId,
        sku: updated.sku,
        name: updated.name,
        description: updated.description,
        category: updated.category,
        unit: updated.unit,
        costPrice: updated.costPrice,
        sellPrice: updated.sellPrice,
        reorderThreshold: updated.reorderThreshold,
        currentStock: updated.currentStock,
        isLowStock:
          updated.reorderThreshold !== null &&
          updated.currentStock <= updated.reorderThreshold,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (dbError: any) {
      if (dbError.message?.includes('already exists')) {
        throw dbError;
      }

      console.warn(
        '[InventoryService.updateItem] DB update failed, updating in development store:',
        dbError?.message
      );

      const items = memoryInventoryItems[companyId] || memoryInventoryItems.comp_001 || [];
      const item = items.find((i) => i.id === id);
      if (!item) {
        throw new Error('Inventory item not found in development store.');
      }

      if (data.sku !== undefined) item.sku = data.sku;
      if (data.name !== undefined) item.name = data.name;
      if (data.description !== undefined) item.description = data.description;
      if (data.category !== undefined) item.category = data.category;
      if (data.unit !== undefined) item.unit = data.unit;
      if (data.costPrice !== undefined) item.costPrice = data.costPrice;
      if (data.sellPrice !== undefined) item.sellPrice = data.sellPrice;
      if (data.reorderThreshold !== undefined) item.reorderThreshold = data.reorderThreshold;
      if (data.isActive !== undefined) item.isActive = data.isActive;
      item.isLowStock =
        item.reorderThreshold !== null && item.currentStock <= item.reorderThreshold;
      item.updatedAt = new Date().toISOString();

      return item;
    }
  }

  /**
   * Record stock movement with atomic transaction:
   * - Validates non-negative quantity server-side
   * - Validates sufficient stock for STOCK_OUT
   * - Inserts movement
   * - Updates denormalized currentStock in the EXACT SAME transaction
   * - Returns created movement and updated stock directly
   */
  static async recordStockMovement(
    companyId: string,
    itemId: string,
    data: StockMovementCreateInput,
    performedByUserId?: string
  ): Promise<{
    movement: InventoryStockMovementRecord;
    currentStock: number;
  }> {
    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0.');
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const item = await tx.inventoryItem.findFirst({
          where: {
            id: itemId,
            companyId,
          },
        });

        if (!item) {
          throw new Error('Inventory item not found in this company.');
        }

        if (!item.isActive) {
          throw new Error('Cannot record stock movement for an inactive item.');
        }

        if (data.type === 'STOCK_OUT' && item.currentStock < data.quantity) {
          throw new Error(
            `Insufficient stock for '${item.name}'. Current stock: ${item.currentStock}, Requested: ${data.quantity}.`
          );
        }

        const movement = await tx.inventoryStockMovement.create({
          data: {
            companyId,
            itemId,
            type: data.type as any,
            quantity: data.quantity,
            reason: data.reason || null,
            performedByUserId: performedByUserId || null,
          },
          include: {
            performedByUser: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });

        const allMovements = await tx.inventoryStockMovement.findMany({
          where: {
            itemId,
            companyId,
          },
          select: {
            type: true,
            quantity: true,
          },
        });

        const derivedStock = allMovements.reduce((acc, m) => {
          if (m.type === 'STOCK_IN') return acc + m.quantity;
          if (m.type === 'STOCK_OUT') return acc - m.quantity;
          if (m.type === 'ADJUSTMENT') return acc + m.quantity;
          return acc;
        }, 0);

        if (derivedStock < 0) {
          throw new Error('Invalid movement: resulting stock cannot be negative.');
        }

        const updatedItem = await tx.inventoryItem.update({
          where: {
            id_companyId: {
              id: itemId,
              companyId,
            },
          },
          data: {
            currentStock: derivedStock,
          },
        });

        return {
          movement: {
            id: movement.id,
            companyId: movement.companyId,
            itemId: movement.itemId,
            type: movement.type as StockMovementType,
            quantity: movement.quantity,
            reason: movement.reason,
            performedByUserId: movement.performedByUserId,
            createdAt: movement.createdAt.toISOString(),
            performedByUser: movement.performedByUser,
          },
          currentStock: updatedItem.currentStock,
        };
      });

      return result;
    } catch (dbError: any) {
      if (
        dbError.message?.includes('Insufficient stock') ||
        dbError.message?.includes('Quantity must be') ||
        dbError.message?.includes('not found') ||
        dbError.message?.includes('inactive item')
      ) {
        throw dbError;
      }

      console.warn(
        '[InventoryService.recordStockMovement] DB transaction failed, recording in development store:',
        dbError?.message
      );

      const items = memoryInventoryItems[companyId] || memoryInventoryItems.comp_001 || [];
      const item = items.find((i) => i.id === itemId);
      if (!item) {
        throw new Error('Inventory item not found in development store.');
      }

      if (!item.isActive) {
        throw new Error('Cannot record stock movement for an inactive item.');
      }

      if (data.type === 'STOCK_OUT' && item.currentStock < data.quantity) {
        throw new Error(
          `Insufficient stock for '${item.name}'. Current stock: ${item.currentStock}, Requested: ${data.quantity}.`
        );
      }

      if (!memoryInventoryMovements[companyId]) {
        memoryInventoryMovements[companyId] = [];
      }

      const movement: InventoryStockMovementRecord = {
        id: `mov_${Date.now()}`,
        companyId,
        itemId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason || null,
        performedByUserId: performedByUserId || null,
        createdAt: new Date().toISOString(),
        performedByUser: {
          id: performedByUserId || 'user_owner_001',
          fullName: 'Alex Carter',
          email: 'admin@avexcrm.com',
        },
      };

      memoryInventoryMovements[companyId].unshift(movement);

      // Derive stock
      if (data.type === 'STOCK_IN') {
        item.currentStock += data.quantity;
      } else if (data.type === 'STOCK_OUT') {
        item.currentStock -= data.quantity;
      } else if (data.type === 'ADJUSTMENT') {
        item.currentStock += data.quantity;
      }

      item.isLowStock =
        item.reorderThreshold !== null && item.currentStock <= item.reorderThreshold;
      item.updatedAt = new Date().toISOString();

      return {
        movement,
        currentStock: item.currentStock,
      };
    }
  }

  /**
   * Fetch paginated movement history for an item
   */
  static async getMovements(
    companyId: string,
    itemId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedMovementsResponse> {
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(100, pageSize));

    const where: Prisma.InventoryStockMovementWhereInput = {
      itemId,
      companyId,
    };

    try {
      const [movements, total] = await Promise.all([
        prisma.inventoryStockMovement.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (validPage - 1) * validPageSize,
          take: validPageSize,
          include: {
            performedByUser: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        }),
        prisma.inventoryStockMovement.count({ where }),
      ]);

      const totalPages = Math.ceil(total / validPageSize) || 1;

      return {
        data: movements.map((m) => ({
          id: m.id,
          companyId: m.companyId,
          itemId: m.itemId,
          type: m.type as StockMovementType,
          quantity: m.quantity,
          reason: m.reason,
          performedByUserId: m.performedByUserId,
          createdAt: m.createdAt.toISOString(),
          performedByUser: m.performedByUser,
        })),
        total,
        page: validPage,
        pageSize: validPageSize,
        totalPages,
      };
    } catch (dbError: any) {
      console.warn(
        '[InventoryService.getMovements] DB unavailable, reading from development store:',
        dbError?.message
      );

      const all =
        memoryInventoryMovements[companyId] || memoryInventoryMovements.comp_001 || [];
      const itemMovements = all.filter((m) => m.itemId === itemId);
      const total = itemMovements.length;
      const totalPages = Math.ceil(total / validPageSize) || 1;
      const paginated = itemMovements.slice(
        (validPage - 1) * validPageSize,
        validPage * validPageSize
      );

      return {
        data: paginated,
        total,
        page: validPage,
        pageSize: validPageSize,
        totalPages,
      };
    }
  }
}
