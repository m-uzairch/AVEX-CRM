/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const db = prisma as any;

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const isArchived = body.isArchived !== undefined ? Boolean(body.isArchived) : !lead.isArchived;

    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        isArchived,
        updatedBy: 'Alex Carter',
      },
    });

    try {
      await db.activityLog.create({
        data: {
          companyId: lead.companyId,
          action: isArchived ? 'LEAD_ARCHIVED' : 'LEAD_RESTORED',
          module: 'CRM',
          description: isArchived
            ? `Archived lead ${lead.name}`
            : `Unarchived lead ${lead.name}`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error('[API POST /api/crm/leads/[id]/archive] Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle lead archive state.' },
      { status: 500 }
    );
  }
}
