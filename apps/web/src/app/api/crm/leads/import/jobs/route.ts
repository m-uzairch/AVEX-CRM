/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(_request: NextRequest) {
  try {
    const db = prisma as any;

    if (!db.importJob) {
      return NextResponse.json({ jobs: [] });
    }

    const jobs = await db.importJob.findMany({
      where: { companyId: 'comp_001' },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { fullName: true, email: true } },
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('[API GET /api/crm/leads/import/jobs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve import jobs history.' },
      { status: 500 }
    );
  }
}
