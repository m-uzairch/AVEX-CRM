import { z } from 'zod';

export const inventoryItemCreateSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must not exceed 50 characters')
    .transform((v) => v.trim().toUpperCase()),
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(150, 'Item name must not exceed 150 characters'),
  description: z.string().max(1000, 'Description is too long').optional().nullable(),
  category: z.string().max(100, 'Category name is too long').optional().nullable(),
  unit: z.string().min(1, 'Unit is required').max(30, 'Unit is too long').default('pcs'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative').default(0),
  sellPrice: z.coerce.number().min(0, 'Sell price cannot be negative').default(0),
  reorderThreshold: z.coerce.number().int().min(0, 'Threshold cannot be negative').optional().nullable(),
  isActive: z.boolean().default(true),
});

export const inventoryItemUpdateSchema = inventoryItemCreateSchema.partial();

export const stockMovementCreateSchema = z.object({
  type: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'], {
    errorMap: () => ({ message: 'Type must be STOCK_IN, STOCK_OUT, or ADJUSTMENT' }),
  }),
  quantity: z.coerce
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be greater than 0'),
  reason: z.string().max(255, 'Reason must not exceed 255 characters').optional().nullable(),
});

export type InventoryItemCreateInput = z.infer<typeof inventoryItemCreateSchema>;
export type InventoryItemUpdateInput = z.infer<typeof inventoryItemUpdateSchema>;
export type StockMovementCreateInput = z.infer<typeof stockMovementCreateSchema>;
