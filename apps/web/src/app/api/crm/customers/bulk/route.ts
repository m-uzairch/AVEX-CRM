/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerIds, targetStatus, targetEmployeeId } = body;
    const db = prisma as any;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'No customer IDs specified for bulk action.' },
        { status: 400 }
      );
    }

    if (action === 'DELETE') {
      await db.customer.updateMany({
        where: { id: { in: customerIds } },
        data: { deletedAt: new Date(), updatedBy: 'Alex Carter' },
      });
    } else if (action === 'RESTORE') {
      await db.customer.updateMany({
        where: { id: { in: customerIds } },
        data: { deletedAt: null, updatedBy: 'Alex Carter' },
      });
    } else if (action === 'ARCHIVE') {
      await db.customer.updateMany({
        where: { id: { in: customerIds } },
        data: { isArchived: true, updatedBy: 'Alex Carter' },
      });
    } else if (action === 'UNARCHIVE') {
      await db.customer.updateMany({
        where: { id: { in: customerIds } },
        data: { isArchived: false, updatedBy: 'Alex Carter' },
      });
    } else if (action === 'CHANGE_STATUS' && targetStatus) {
      await db.customer.updateMany({
        where: { id: { in: customerIds } },
        data: { status: targetStatus, updatedBy: 'Alex Carter' },
      });
    } else if (action === 'ASSIGN_EMPLOYEE' && targetEmployeeId) {
      await db.customer.updateMany({
        where: { id: { in: customerIds } },
        data: { assignedEmployeeId: targetEmployeeId, updatedBy: 'Alex Carter' },
      });
    }

    return NextResponse.json({
      message: `Bulk action ${action} executed successfully on ${customerIds.length} records.`,
    });
  } catch (error) {
    console.error('[API POST /api/crm/customers/bulk] Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute bulk action.' },
      { status: 500 }
    );
  }
}
