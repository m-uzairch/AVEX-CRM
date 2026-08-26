/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { inventoryItemUpdateSchema } from '@/features/inventory/schemas/inventory-schemas';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';

/**
 * GET /api/inventory/items/[id]
 * Item detail + stock movement history (company-scoped)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can access inventory
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to access inventory.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const detail = await InventoryService.getItemById(auth.companyId, id);

    if (!detail) {
      return NextResponse.json({ error: 'Inventory item not found.' }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error: any) {
    console.error('[API GET /api/inventory/items/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch inventory item details.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inventory/items/[id]
 * Update inventory item (Admin only, company-scoped)
 * Returns the updated record directly (no write-then-refetch pattern)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can modify inventory items
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can modify inventory items.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = inventoryItemUpdateSchema.parse(body);

    const updated = await InventoryService.updateItem(auth.companyId, id, validated);

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    console.error('[API PATCH /api/inventory/items/[id]] Error:', error);
    const isValidation = error?.name === 'ZodError';
    const isConflict = error?.message?.includes('already exists');
    return NextResponse.json(
      { error: error?.message || 'Failed to update inventory item.' },
      { status: isValidation ? 400 : isConflict ? 409 : 500 }
    );
  }
}
