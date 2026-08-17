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

    if (!db.leadStageHistory) {
      return NextResponse.json({ history: [] });
    }

    const history = await db.leadStageHistory.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        updatedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('[API GET /api/crm/leads/[id]/stage-history] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve stage history.' },
      { status: 500 }
    );
  }
}
