/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { stockMovementCreateSchema } from '@/features/inventory/schemas/inventory-schemas';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';

/**
 * GET /api/inventory/items/[id]/movements
 * Movement history for an item (paginated, company-scoped)
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
        { error: 'Access denied. You do not have permission to view stock movements.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const result = await InventoryService.getMovements(
      auth.companyId,
      id,
      page,
      pageSize
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API GET /api/inventory/items/[id]/movements] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch stock movements.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/items/[id]/movements
 * Record stock movement (Stock In / Stock Out / Adjustment)
 * Single atomic transaction updating stock movement and denormalized currentStock
 * Server-side positive quantity validation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can record stock movements
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can record stock movements.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = stockMovementCreateSchema.parse(body);

    const result = await InventoryService.recordStockMovement(
      auth.companyId,
      id,
      validated,
      auth.userId
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/inventory/items/[id]/movements] Error:', error);
    const isValidation = error?.name === 'ZodError';
    const isInsufficient = error?.message?.includes('Insufficient stock');
    const isInvalid = error?.message?.includes('Quantity must be') || error?.message?.includes('Invalid movement');
    const isNotFound = error?.message?.includes('not found');

    const status = isValidation || isInsufficient || isInvalid ? 400 : isNotFound ? 404 : 500;

    return NextResponse.json(
      { error: error?.message || 'Failed to record stock movement.' },
      { status }
    );
  }
}
