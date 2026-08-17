/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    if (db.savedFilter) {
      await db.savedFilter.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: 'Saved filter preset deleted.' });
  } catch (error) {
    console.error('[API DELETE /api/search/saved-filters/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved filter.' },
      { status: 500 }
    );
  }
}
