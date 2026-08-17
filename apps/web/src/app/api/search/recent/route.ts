/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(_request: NextRequest) {
  try {
    const userId = 'usr_001';
    const db = prisma as any;

    if (!db.recentSearch) {
      return NextResponse.json({ searches: [] });
    }

    const searches = await db.recentSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      distinct: ['query'],
    });

    return NextResponse.json({ searches });
  } catch (error) {
    console.error('[API GET /api/search/recent] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recent searches.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const userId = 'usr_001';
    const db = prisma as any;

    if (db.recentSearch) {
      await db.recentSearch.deleteMany({
        where: { userId },
      });
    }

    return NextResponse.json({ success: true, message: 'Recent search history cleared.' });
  } catch (error) {
    console.error('[API DELETE /api/search/recent] Error:', error);
    return NextResponse.json(
      { error: 'Failed to clear recent search history.' },
      { status: 500 }
    );
  }
}
