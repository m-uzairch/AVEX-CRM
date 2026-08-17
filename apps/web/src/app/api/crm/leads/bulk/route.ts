/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { leadBulkActionSchema } from '@/features/crm/schemas/lead-schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = leadBulkActionSchema.parse(body);

    const db = prisma as any;
    const { leadIds, action, assignedEmployeeId, status, priority, tags } = validated;

    if (!db.lead) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    let updatedCount = 0;

    switch (action) {
      case 'ASSIGN_EMPLOYEE': {
        const result = await db.lead.updateMany({
          where: { id: { in: leadIds } },
          data: {
            assignedEmployeeId: assignedEmployeeId || null,
            updatedBy: 'Alex Carter',
          },
        });
        updatedCount = result.count;
        break;
      }

      case 'CHANGE_STATUS': {
        if (!status) {
          return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
        }
        const result = await db.lead.updateMany({
          where: { id: { in: leadIds } },
          data: {
            status,
            updatedBy: 'Alex Carter',
          },
        });
        updatedCount = result.count;
        break;
      }

      case 'CHANGE_PRIORITY': {
        if (!priority) {
          return NextResponse.json({ error: 'Priority is required.' }, { status: 400 });
        }
        const result = await db.lead.updateMany({
          where: { id: { in: leadIds } },
          data: {
            priority,
            updatedBy: 'Alex Carter',
          },
        });
        updatedCount = result.count;
        break;
      }

      case 'ADD_TAGS': {
        if (!tags || tags.length === 0) {
          return NextResponse.json({ error: 'Tags are required.' }, { status: 400 });
        }
        const targets = await db.lead.findMany({
          where: { id: { in: leadIds } },
          select: { id: true, tags: true },
        });
        for (const item of targets) {
          const merged = Array.from(new Set([...(item.tags || []), ...tags]));
          await db.lead.update({
            where: { id: item.id },
            data: { tags: merged, updatedBy: 'Alex Carter' },
          });
          updatedCount++;
        }
        break;
      }

      case 'REMOVE_TAGS': {
        if (!tags || tags.length === 0) {
          return NextResponse.json({ error: 'Tags are required.' }, { status: 400 });
        }
        const targets = await db.lead.findMany({
          where: { id: { in: leadIds } },
          select: { id: true, tags: true },
        });
        for (const item of targets) {
          const filtered = (item.tags || []).filter((t: string) => !tags.includes(t));
          await db.lead.update({
            where: { id: item.id },
            data: { tags: filtered, updatedBy: 'Alex Carter' },
          });
          updatedCount++;
        }
        break;
      }

      case 'ARCHIVE': {
        const result = await db.lead.updateMany({
          where: { id: { in: leadIds } },
          data: { isArchived: true, updatedBy: 'Alex Carter' },
        });
        updatedCount = result.count;
        break;
      }

      case 'RESTORE': {
        const result = await db.lead.updateMany({
          where: { id: { in: leadIds } },
          data: { isArchived: false, deletedAt: null, updatedBy: 'Alex Carter' },
        });
        updatedCount = result.count;
        break;
      }

      case 'DELETE': {
        const result = await db.lead.updateMany({
          where: { id: { in: leadIds } },
          data: { deletedAt: new Date(), updatedBy: 'Alex Carter' },
        });
        updatedCount = result.count;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    try {
      await db.activityLog.create({
        data: {
          companyId: 'comp_001',
          action: `LEAD_BULK_${action}`,
          module: 'CRM',
          description: `Performed bulk action ${action} on ${updatedCount} leads`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      count: updatedCount,
      message: `Bulk operation '${action}' executed successfully on ${updatedCount} leads.`,
    });
  } catch (error: any) {
    console.error('[API POST /api/crm/leads/bulk] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute bulk operation.' },
      { status: 400 }
    );
  }
}
