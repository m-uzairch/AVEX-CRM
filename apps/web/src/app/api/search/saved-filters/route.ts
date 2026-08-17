/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { savedFilterSchema } from '@/features/search/schemas/search-schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module') || 'ALL';

    const userId = 'usr_001';
    const db = prisma as any;

    if (!db.savedFilter) {
      return NextResponse.json({ filters: [] });
    }

    const where: any = { userId };
    if (moduleFilter !== 'ALL') {
      where.module = moduleFilter;
    }

    const filters = await db.savedFilter.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ filters });
  } catch (error) {
    console.error('[API GET /api/search/saved-filters] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve saved filters.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = savedFilterSchema.parse(body);

    const companyId = 'comp_001';
    const userId = 'usr_001';
    const db = prisma as any;

    if (!db.savedFilter) {
      return NextResponse.json(
        {
          filter: {
            id: `filter-${Date.now()}`,
            companyId,
            userId,
            ...validated,
            createdAt: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    }

    const filter = await db.savedFilter.create({
      data: {
        companyId,
        userId,
        name: validated.name,
        module: validated.module,
        filterConfig: validated.filterConfig,
      },
    });

    try {
      if (db.activityLog) {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'SAVED_FILTER_CREATED',
            module: 'CRM',
            description: `Saved filter preset '${filter.name}' created`,
          },
        });
      }
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ filter }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/search/saved-filters] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create saved filter preset.' },
      { status: 400 }
    );
  }
}
