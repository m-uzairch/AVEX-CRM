/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { dealInfoUpdateSchema } from '@/features/crm/schemas/pipeline-schemas';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = dealInfoUpdateSchema.parse(body);

    const db = prisma as any;
    const existingLead = await db.lead.findUnique({ where: { id } });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const updateData: any = { updatedBy: 'Alex Carter' };

    if (validated.expectedDealValue !== undefined)
      updateData.expectedDealValue = validated.expectedDealValue;
    if (validated.winProbability !== undefined)
      updateData.winProbability = validated.winProbability;
    if (validated.expectedClosingDate !== undefined)
      updateData.expectedClosingDate = validated.expectedClosingDate
        ? new Date(validated.expectedClosingDate)
        : null;

    const updatedLead = await db.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedEmployee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    try {
      await db.activityLog.create({
        data: {
          companyId: existingLead.companyId,
          action: 'LEAD_DEAL_UPDATED',
          module: 'CRM',
          description: `Updated deal parameters for ${updatedLead.name} (Value: $${updatedLead.expectedDealValue || 0}, Win Prob: ${updatedLead.winProbability}%)`,
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ lead: updatedLead });
  } catch (error: any) {
    console.error('[API PATCH /api/crm/leads/[id]/deal] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update deal parameters.' },
      { status: 400 }
    );
  }
}
