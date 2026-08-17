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

    const sourceProject = await db.project.findUnique({
      where: { id },
      include: {
        milestones: true,
        members: true,
      },
    });

    if (!sourceProject) {
      return NextResponse.json({ error: 'Source project not found.' }, { status: 404 });
    }

    // Generate unique project code for duplicated project: AVX-0001 format
    const lastProject = await db.project.findFirst({
      where: { companyId: sourceProject.companyId },
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

    const duplicatedProject = await db.project.create({
      data: {
        companyId: sourceProject.companyId,
        projectCode,
        name: `${sourceProject.name} (Copy)`,
        description: sourceProject.description,
        customerId: sourceProject.customerId,
        projectManagerId: sourceProject.projectManagerId,
        categoryId: sourceProject.categoryId,
        status: 'PLANNING',
        priority: sourceProject.priority,
        businessType: sourceProject.businessType,
        currency: sourceProject.currency,
        templateId: sourceProject.templateId,
        budget: sourceProject.budget,
        createdBy: 'Alex Carter',
        updatedBy: 'Alex Carter',
        members: sourceProject.members && sourceProject.members.length > 0
          ? {
              create: sourceProject.members.map((m: any) => ({
                userId: m.userId,
                role: m.role,
              })),
            }
          : undefined,
        milestones: sourceProject.milestones && sourceProject.milestones.length > 0
          ? {
              create: sourceProject.milestones.map((m: any) => ({
                companyId: sourceProject.companyId,
                title: m.title,
                description: m.description,
                order: m.order,
                status: 'PENDING',
              })),
            }
          : undefined,
      },
      include: {
        customer: true,
        projectManager: true,
        category: true,
      },
    });

    // Log Activity
    try {
      await db.activityLog.create({
        data: {
          companyId: sourceProject.companyId,
          action: 'PROJECT_CREATED',
          module: 'PROJECTS',
          category: 'DUPLICATION',
          entityType: 'PROJECT',
          entityId: duplicatedProject.id,
          description: `Duplicated project ${sourceProject.projectCode} as ${duplicatedProject.projectCode}`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({ project: duplicatedProject }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/projects/[id]/duplicate] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to duplicate project.' },
      { status: 500 }
    );
  }
}
