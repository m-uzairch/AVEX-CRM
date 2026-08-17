/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const db = prisma as any;

    const where: any = { status: 'ACTIVE' };

    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
      },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[API GET /api/crm/users/mentions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user mentions list.' },
      { status: 500 }
    );
  }
}
