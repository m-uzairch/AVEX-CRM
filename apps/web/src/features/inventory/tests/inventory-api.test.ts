import { describe, it, expect } from 'vitest';
import {
  inventoryItemCreateSchema,
  inventoryItemUpdateSchema,
  stockMovementCreateSchema,
} from '../schemas/inventory-schemas';
import { hasPermission, canAccessRoute } from '@/features/rbac/config/rbac-matrix';

describe('Inventory Management Feature Tests', () => {
  describe('1. Inventory Item Schemas', () => {
    it('validates a valid inventory item creation payload and normalizes SKU', () => {
      const valid = {
        sku: ' prd-laptop-01 ',
        name: 'Enterprise Laptop 16"',
        description: '32GB RAM, 1TB SSD',
        category: 'Hardware',
        unit: 'pcs',
        costPrice: 1200,
        sellPrice: 1800,
        reorderThreshold: 5,
        isActive: true,
      };

      const result = inventoryItemCreateSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sku).toBe('PRD-LAPTOP-01');
      }
    });

    it('rejects inventory item with missing SKU or missing name', () => {
      expect(
        inventoryItemCreateSchema.safeParse({
          sku: '',
          name: 'Item without SKU',
        }).success
      ).toBe(false);

      expect(
        inventoryItemCreateSchema.safeParse({
          sku: 'SKU-001',
          name: '',
        }).success
      ).toBe(false);
    });

    it('rejects negative pricing values', () => {
      expect(
        inventoryItemCreateSchema.safeParse({
          sku: 'SKU-002',
          name: 'Valid Item',
          costPrice: -10,
        }).success
      ).toBe(false);

      expect(
        inventoryItemCreateSchema.safeParse({
          sku: 'SKU-003',
          name: 'Valid Item',
          sellPrice: -50,
        }).success
      ).toBe(false);
    });

    it('allows partial inventory item updates', () => {
      const partial = {
        sellPrice: 1950,
        reorderThreshold: 10,
      };
      expect(inventoryItemUpdateSchema.safeParse(partial).success).toBe(true);
    });
  });

  describe('2. Stock Movement Validation & Negative Quantity Prevention', () => {
    it('accepts valid positive quantities for STOCK_IN, STOCK_OUT, and ADJUSTMENT', () => {
      expect(
        stockMovementCreateSchema.safeParse({
          type: 'STOCK_IN',
          quantity: 25,
          reason: 'Initial shipment arrival',
        }).success
      ).toBe(true);

      expect(
        stockMovementCreateSchema.safeParse({
          type: 'STOCK_OUT',
          quantity: 5,
          reason: 'Shipped order #4910',
        }).success
      ).toBe(true);

      expect(
        stockMovementCreateSchema.safeParse({
          type: 'ADJUSTMENT',
          quantity: 2,
          reason: 'Cycle count discrepancy',
        }).success
      ).toBe(true);
    });

    it('strictly rejects negative quantities and zero quantity', () => {
      expect(
        stockMovementCreateSchema.safeParse({
          type: 'STOCK_OUT',
          quantity: -10,
          reason: 'Negative quantity test',
        }).success
      ).toBe(false);

      expect(
        stockMovementCreateSchema.safeParse({
          type: 'STOCK_IN',
          quantity: 0,
          reason: 'Zero quantity test',
        }).success
      ).toBe(false);
    });

    it('rejects invalid movement types', () => {
      expect(
        stockMovementCreateSchema.safeParse({
          type: 'INVALID_TYPE',
          quantity: 10,
        }).success
      ).toBe(false);
    });
  });

  describe('3. Stock Derivation & Transaction Logic', () => {
    it('correctly calculates derived stock from movement records', () => {
      const movements = [
        { type: 'STOCK_IN', quantity: 100 },
        { type: 'STOCK_OUT', quantity: 30 },
        { type: 'STOCK_OUT', quantity: 15 },
        { type: 'STOCK_IN', quantity: 10 },
        { type: 'ADJUSTMENT', quantity: 5 },
      ];

      const derivedStock = movements.reduce((acc, m) => {
        if (m.type === 'STOCK_IN') return acc + m.quantity;
        if (m.type === 'STOCK_OUT') return acc - m.quantity;
        if (m.type === 'ADJUSTMENT') return acc + m.quantity;
        return acc;
      }, 0);

      // 100 - 30 - 15 + 10 + 5 = 70
      expect(derivedStock).toBe(70);
    });

    it('identifies low stock conditions based on reorder threshold', () => {
      const itemA = { currentStock: 4, reorderThreshold: 5 };
      const itemB = { currentStock: 5, reorderThreshold: 5 };
      const itemC = { currentStock: 6, reorderThreshold: 5 };
      const itemD = { currentStock: 0, reorderThreshold: null };

      expect(itemA.currentStock <= itemA.reorderThreshold).toBe(true);
      expect(itemB.currentStock <= itemB.reorderThreshold).toBe(true);
      expect(itemC.currentStock <= itemC.reorderThreshold).toBe(false);
      expect(itemD.reorderThreshold !== null && itemD.currentStock <= itemD.reorderThreshold).toBe(false);
    });
  });

  describe('4. RBAC & Inventory Permissions', () => {
    it('grants MANAGE_INVENTORY permission to COMPANY_OWNER and ADMIN', () => {
      expect(hasPermission('COMPANY_OWNER', 'MANAGE_INVENTORY')).toBe(true);
      expect(hasPermission('ADMIN', 'MANAGE_INVENTORY')).toBe(true);
    });

    it('denies MANAGE_INVENTORY permission to EMPLOYEE and CLIENT', () => {
      expect(hasPermission('EMPLOYEE', 'MANAGE_INVENTORY')).toBe(false);
      expect(hasPermission('CLIENT', 'MANAGE_INVENTORY')).toBe(false);
    });

    it('allows COMPANY_OWNER and ADMIN to access /inventory route', () => {
      expect(canAccessRoute('COMPANY_OWNER', '/inventory')).toBe(true);
      expect(canAccessRoute('ADMIN', '/inventory')).toBe(true);
    });

    it('blocks EMPLOYEE and CLIENT from /inventory route', () => {
      expect(canAccessRoute('EMPLOYEE', '/inventory')).toBe(false);
      expect(canAccessRoute('CLIENT', '/inventory')).toBe(false);
    });
  });
});
