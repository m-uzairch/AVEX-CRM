/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { DEFAULT_MILESTONES } from '@/features/projects/services/project-automation-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const db = prisma as any;

    const lead = await db.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    if (lead.isConverted) {
      return NextResponse.json(
        { error: 'Lead has already been converted to a customer.' },
        { status: 400 }
      );
    }

    // 1. Create corresponding Customer record
    const customer = await db.customer.create({
      data: {
        companyId: lead.companyId,
        assignedEmployeeId: lead.assignedEmployeeId || null,
        name: lead.name,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        alternatePhone: lead.alternatePhone || null,
        country: lead.country || null,
        state: lead.state || null,
        city: lead.city || null,
        address: lead.address || null,
        postalCode: lead.postalCode || null,
        industry: lead.industry || null,
        businessType: lead.businessType || null,
        website: lead.website || null,
        companySize: lead.companySize || null,
        status: body.customerStatus || 'ACTIVE',
        source: lead.source || 'Lead Conversion',
        priority: lead.priority || 'MEDIUM',
        tags: lead.tags || [],
        createdBy: 'Alex Carter',
        updatedBy: 'Alex Carter',
      },
    });

    // 2. Mark lead as converted & status = WON
    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        status: 'WON',
        isConverted: true,
        convertedCustomerId: customer.id,
        convertedAt: new Date(),
        updatedBy: 'Alex Carter',
      },
      include: {
        assignedEmployee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        convertedCustomer: {
          select: { id: true, name: true, companyName: true },
        },
      },
    });

    // 3. AUTOMATIC PROJECT CREATION
    // Generate unique project code: AVX-0001 format
    const lastProject = await db.project.findFirst({
      where: { companyId: lead.companyId },
      orderBy: { createdAt: 'desc' },
      select: { projectCode: true },
    });

    let nextNumber = 1;
    if (lastProject && lastProject.projectCode) {
      const match = lastProject.projectCode.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }
    const projectCode = `AVX-${String(nextNumber).padStart(4, '0')}`;

    const projectName = body.projectName || `${lead.companyName} Implementation`;
    const projectManagerId = lead.assignedEmployeeId || null;

    const project = await db.project.create({
      data: {
        companyId: lead.companyId,
        projectCode,
        name: projectName,
        description: `Project automatically generated from converted lead ${lead.name} (${lead.companyName}).`,
        customerId: customer.id,
        projectManagerId,
        businessType: lead.businessType || 'DIGITAL',
        status: 'IN_PROGRESS',
        priority: lead.priority || 'MEDIUM',
        budget: lead.expectedDealValue || null,
        createdBy: 'Automation Engine',
        updatedBy: 'Automation Engine',
        members: projectManagerId
          ? {
              create: [
                {
                  userId: projectManagerId,
                  role: 'PROJECT_MANAGER',
                },
              ],
            }
          : undefined,
        milestones: {
          create: DEFAULT_MILESTONES.map((m) => ({
            companyId: lead.companyId,
            title: m.title,
            description: m.description,
            order: m.order,
            status: 'PENDING',
          })),
        },
      },
    });

    // 4. Create conversion note if provided
    if (body.notes) {
      try {
        await db.customerNote.create({
          data: {
            customerId: customer.id,
            companyId: lead.companyId,
            content: `Conversion Note: ${body.notes}`,
            createdById: lead.assignedEmployeeId || 'usr_001',
          },
        });
      } catch {
        // Ignore
      }
    }

    // 5. Activity Logs & Notifications
    try {
      await db.activityLog.create({
        data: {
          companyId: lead.companyId,
          action: 'LEAD_CONVERTED',
          module: 'CRM',
          description: `Converted lead ${lead.name} (${lead.companyName}) to Customer #${customer.id}`,
        },
      });

      await db.activityLog.create({
        data: {
          companyId: lead.companyId,
          action: 'CUSTOMER_CREATED',
          module: 'CRM',
          description: `Customer account created from converted lead ${lead.name}`,
        },
      });

      await db.activityLog.create({
        data: {
          companyId: lead.companyId,
          action: 'PROJECT_CREATED',
          module: 'PROJECTS',
          category: 'AUTOMATION',
          entityType: 'PROJECT',
          entityId: project.id,
          description: `Automatically created project ${project.projectCode}: ${project.name} for converted customer`,
          metadata: { projectCode: project.projectCode, autoGenerated: true },
        },
      });
    } catch {
      // Ignore non-critical audit log failures
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      projectId: project.id,
      projectCode: project.projectCode,
      lead: updatedLead,
      message: `Lead ${lead.name} successfully converted into customer account and project ${project.projectCode} automatically created.`,
    });
  } catch (error: any) {
    console.error('[API POST /api/crm/leads/[id]/convert] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to convert lead to customer.' },
      { status: 500 }
    );
  }
}
