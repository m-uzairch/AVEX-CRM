/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { createTagSchema } from '@/features/search/schemas/search-schemas';

export async function GET(_request: NextRequest) {
  try {
    const companyId = 'comp_001';
    const db = prisma as any;

    if (!db.tag) {
      // Default tags fallback
      return NextResponse.json({
        tags: [
          { id: 'tag-1', companyId, name: 'VIP', color: '#8B5CF6', description: 'VIP high-priority client', usageCount: 5 },
          { id: 'tag-2', companyId, name: 'Enterprise', color: '#3B82F6', description: 'Large enterprise accounts', usageCount: 8 },
          { id: 'tag-3', companyId, name: 'Hot Lead', color: '#EF4444', description: 'Urgent hot prospects', usageCount: 12 },
          { id: 'tag-4', companyId, name: 'Follow Up', color: '#F59E0B', description: 'Needs follow up call', usageCount: 4 },
          { id: 'tag-5', companyId, name: 'Returning', color: '#10B981', description: 'Repeat customer', usageCount: 6 },
        ],
      });
    }

    const tags = await db.tag.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    // Calculate tag usage counts from Customer and Lead records
    const leads = db.lead ? await db.lead.findMany({ where: { companyId, deletedAt: null }, select: { tags: true } }) : [];
    const customers = db.customer ? await db.customer.findMany({ where: { companyId, deletedAt: null }, select: { tags: true } }) : [];

    const enrichedTags = tags.map((t: any) => {
      let usageCount = 0;
      leads.forEach((l: any) => {
        if (l.tags && l.tags.includes(t.name)) usageCount++;
      });
      customers.forEach((c: any) => {
        if (c.tags && c.tags.includes(t.name)) usageCount++;
      });
      return { ...t, usageCount };
    });

    return NextResponse.json({ tags: enrichedTags });
  } catch (error) {
    console.error('[API GET /api/search/tags] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workspace tags.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTagSchema.parse(body);

    const companyId = 'comp_001';
    const db = prisma as any;

    if (!db.tag) {
      return NextResponse.json(
        {
          tag: {
            id: `tag-${Date.now()}`,
            companyId,
            ...validated,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    }

    // Check duplicate tag name
    const existing = await db.tag.findFirst({
      where: { companyId, name: { equals: validated.name, mode: 'insensitive' } },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Tag '${validated.name}' already exists.` },
        { status: 400 }
      );
    }

    const tag = await db.tag.create({
      data: {
        companyId,
        name: validated.name,
        color: validated.color,
        description: validated.description || null,
      },
    });

    try {
      if (db.activityLog) {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'TAG_CREATED',
            module: 'CRM',
            description: `Smart tag '#${tag.name}' created with color ${tag.color}`,
          },
        });
      }
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ tag: { ...tag, usageCount: 0 } }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/search/tags] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create tag.' },
      { status: 400 }
    );
  }
}
