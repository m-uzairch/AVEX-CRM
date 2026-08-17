/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    if (!db.lead) {
      return NextResponse.json({ error: 'Database model unavailable' }, { status: 500 });
    }

    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        assignedEmployee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        convertedCustomer: {
          select: { id: true, name: true, companyName: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, fullName: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    // Fetch related activity logs
    let activityLogs = [];
    try {
      activityLogs = await db.activityLog.findMany({
        where: {
          companyId: lead.companyId,
          description: { contains: lead.name },
        },
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: {
          user: { select: { fullName: true } },
        },
      });
    } catch {
      // Ignore if logs lookup fails
    }

    return NextResponse.json({
      lead: {
        ...lead,
        activityLogs,
      },
    });
  } catch (error) {
    console.error('[API GET /api/crm/leads/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve lead.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const existingLead = await db.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const updateData: any = {
      updatedBy: 'Alex Carter',
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.companyName !== undefined) updateData.companyName = body.companyName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.alternatePhone !== undefined) updateData.alternatePhone = body.alternatePhone || null;
    if (body.country !== undefined) updateData.country = body.country || null;
    if (body.state !== undefined) updateData.state = body.state || null;
    if (body.city !== undefined) updateData.city = body.city || null;
    if (body.address !== undefined) updateData.address = body.address || null;
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode || null;
    if (body.industry !== undefined) updateData.industry = body.industry || null;
    if (body.businessType !== undefined) updateData.businessType = body.businessType || null;
    if (body.website !== undefined) updateData.website = body.website || null;
    if (body.companySize !== undefined) updateData.companySize = body.companySize || null;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.score !== undefined) updateData.score = body.score;
    if (body.expectedDealValue !== undefined) updateData.expectedDealValue = body.expectedDealValue || null;
    if (body.expectedClosingDate !== undefined)
      updateData.expectedClosingDate = body.expectedClosingDate ? new Date(body.expectedClosingDate) : null;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.assignedEmployeeId !== undefined) updateData.assignedEmployeeId = body.assignedEmployeeId || null;

    const updatedLead = await db.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedEmployee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    // Log significant changes in ActivityLog
    try {
      const logs = [];
      if (body.status && body.status !== existingLead.status) {
        logs.push(`Changed status of lead ${updatedLead.name} from ${existingLead.status} to ${body.status}`);
      }
      if (body.score !== undefined && body.score !== existingLead.score) {
        logs.push(`Updated lead score for ${updatedLead.name} from ${existingLead.score} to ${body.score}`);
      }
      if (body.assignedEmployeeId !== undefined && body.assignedEmployeeId !== existingLead.assignedEmployeeId) {
        logs.push(`Reassigned lead ${updatedLead.name} to employee`);
      }
      if (logs.length === 0) {
        logs.push(`Updated lead profile details for ${updatedLead.name}`);
      }

      for (const desc of logs) {
        await db.activityLog.create({
          data: {
            companyId: existingLead.companyId,
            action: 'LEAD_UPDATED',
            module: 'CRM',
            description: desc,
          },
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({ lead: updatedLead });
  } catch (error: any) {
    console.error('[API PATCH /api/crm/leads/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update lead.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
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

    // Perform soft delete
    await db.lead.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: 'Alex Carter',
      },
    });

    try {
      await db.activityLog.create({
        data: {
          companyId: lead.companyId,
          action: 'LEAD_DELETED',
          module: 'CRM',
          description: `Soft deleted lead ${lead.name} (${lead.companyName})`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: 'Lead soft deleted successfully.' });
  } catch (error) {
    console.error('[API DELETE /api/crm/leads/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead.' },
      { status: 500 }
    );
  }
}
