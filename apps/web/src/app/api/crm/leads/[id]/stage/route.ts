/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { leadStageUpdateSchema } from '@/features/crm/schemas/pipeline-schemas';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = leadStageUpdateSchema.parse(body);

    const db = prisma as any;
    const existingLead = await db.lead.findUnique({ where: { id } });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const oldStage = existingLead.status;
    const newStage = validated.toStage;

    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        status: newStage,
        stageOrder: validated.stageOrder ?? existingLead.stageOrder,
        updatedBy: 'Alex Carter',
      },
      include: {
        assignedEmployee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    // Record stage history audit trail if stage changed
    if (oldStage !== newStage) {
      try {
        if (db.leadStageHistory) {
          await db.leadStageHistory.create({
            data: {
              leadId: id,
              companyId: existingLead.companyId,
              fromStage: oldStage,
              toStage: newStage,
              updatedById: 'usr_001',
            },
          });
        }
      } catch {
        // Non-blocking
      }

      // Record ActivityLog
      try {
        await db.activityLog.create({
          data: {
            companyId: existingLead.companyId,
            action: 'LEAD_STAGE_CHANGED',
            module: 'CRM',
            description: `Moved lead ${updatedLead.name} from stage '${oldStage}' to '${newStage}'`,
          },
        });
      } catch {
        // Non-blocking
      }
    }

    return NextResponse.json({ lead: updatedLead });
  } catch (error: any) {
    console.error('[API PATCH /api/crm/leads/[id]/stage] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update lead stage.' },
      { status: 400 }
    );
  }
}
