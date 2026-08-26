/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { inventoryItemCreateSchema } from '@/features/inventory/schemas/inventory-schemas';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';

/**
 * GET /api/inventory/items
 * List inventory items (company-scoped)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can access inventory
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to access inventory.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam === null ? undefined : isActiveParam === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const result = await InventoryService.getItems(auth.companyId, {
      search,
      category,
      lowStockOnly,
      isActive,
      page,
      pageSize,
      sortField,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API GET /api/inventory/items] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch inventory items.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/items
 * Create inventory item (Admin only, company-scoped)
 * Returns the created record directly (no write-then-refetch pattern)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can create inventory items
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can add inventory items.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = inventoryItemCreateSchema.parse(body);

    const item = await InventoryService.createItem(auth.companyId, validated);

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/inventory/items] Error:', error);
    const isValidation = error?.name === 'ZodError';
    const isConflict = error?.message?.includes('already exists');
    return NextResponse.json(
      { error: error?.message || 'Failed to create inventory item.' },
      { status: isValidation ? 400 : isConflict ? 409 : 500 }
    );
  }
}
