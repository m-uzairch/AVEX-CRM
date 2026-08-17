/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const projectId = searchParams.get('projectId');
    const db = prisma as any;

    const where: any = { isActive: true };
    if (companyId) where.companyId = companyId;
    if (projectId) where.projectId = projectId;

    const announcements = await db.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('[GET /api/announcements]', error);
    return NextResponse.json({ error: 'Failed to fetch announcements.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = prisma as any;

    const project = body.projectId
      ? await db.project.findUnique({ where: { id: body.projectId }, select: { companyId: true } })
      : null;

    const companyId = project?.companyId || body.companyId || 'comp_001';

    const announcement = await db.announcement.create({
      data: {
        companyId,
        projectId: body.projectId || null,
        type: body.type || 'COMPANY',
        priority: body.priority || 'NORMAL',
        title: body.title,
        description: body.description,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        authorId: 'usr_001',
      },
      include: {
        author: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/announcements]', error);
    return NextResponse.json({ error: error?.message || 'Failed to create announcement.' }, { status: 400 });
  }
}
