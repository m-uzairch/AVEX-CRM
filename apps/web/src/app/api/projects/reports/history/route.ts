/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const db = prisma as any;

    const history = await db.reportHistory.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: {
        generatedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('[API GET /api/projects/reports/history] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch report history.' },
      { status: 500 }
    );
  }
}
