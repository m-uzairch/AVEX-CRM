/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { bulkTagOperationSchema } from '@/features/search/schemas/search-schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = bulkTagOperationSchema.parse(body);

    const companyId = 'comp_001';
    const db = prisma as any;
    const { entityType, entityIds, action, tags } = validated;

    const targetModel = entityType === 'LEAD' ? db.lead : db.customer;
    if (!targetModel) {
      return NextResponse.json({ success: true, message: 'Bulk tag operation completed.' });
    }

    const records = await targetModel.findMany({
      where: { companyId, id: { in: entityIds } },
      select: { id: true, tags: true },
    });

    let updatedCount = 0;

    for (const record of records) {
      let currentTags: string[] = record.tags || [];

      if (action === 'ADD') {
        currentTags = Array.from(new Set([...currentTags, ...tags]));
      } else if (action === 'REMOVE') {
        currentTags = currentTags.filter((t) => !tags.includes(t));
      } else if (action === 'REPLACE') {
        currentTags = [...tags];
      }

      await targetModel.update({
        where: { id: record.id },
        data: { tags: currentTags },
      });
      updatedCount++;
    }

    try {
      if (db.activityLog) {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'BULK_TAG_OPERATION',
            module: 'CRM',
            description: `Executed bulk tag action '${action}' (${tags.join(', ')}) on ${updatedCount} ${entityType.toLowerCase()} records`,
          },
        });
      }
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Bulk tag operation '${action}' applied to ${updatedCount} records.`,
    });
  } catch (error: any) {
    console.error('[API POST /api/search/tags/bulk] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute bulk tag operation.' },
      { status: 400 }
    );
  }
}
