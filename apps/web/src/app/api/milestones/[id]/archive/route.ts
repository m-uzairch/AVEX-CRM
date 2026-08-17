/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const milestone = await db.projectMilestone.update({
      where: { id },
      data: { isArchived: !body.restore },
    });

    return NextResponse.json({ milestone });
  } catch (error: any) {
    console.error('[POST /api/milestones/[id]/archive]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to archive/restore milestone.' },
      { status: 400 }
    );
  }
}
