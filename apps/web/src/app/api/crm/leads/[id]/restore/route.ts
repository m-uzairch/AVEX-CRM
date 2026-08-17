/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        deletedAt: null,
        isArchived: false,
        updatedBy: 'Alex Carter',
      },
    });

    try {
      await db.activityLog.create({
        data: {
          companyId: lead.companyId,
          action: 'LEAD_RESTORED',
          module: 'CRM',
          description: `Restored deleted lead ${lead.name} (${lead.companyName})`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error('[API POST /api/crm/leads/[id]/restore] Error:', error);
    return NextResponse.json(
      { error: 'Failed to restore lead.' },
      { status: 500 }
    );
  }
}
