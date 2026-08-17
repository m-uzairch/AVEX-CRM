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

    if (!db.importJob) {
      return NextResponse.json({ error: 'Import job model unavailable' }, { status: 500 });
    }

    const job = await db.importJob.findUnique({
      where: { id },
      include: {
        createdBy: { select: { fullName: true, email: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Import job not found.' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('[API GET /api/crm/leads/import/jobs/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve import job details.' },
      { status: 500 }
    );
  }
}
