/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const companyId = 'comp_001';
    const db = prisma as any;
    const suggestions: any[] = [];

    // Customer name suggestions
    if (db.customer) {
      const customers = await db.customer.findMany({
        where: {
          companyId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, name: true, companyName: true },
      });

      customers.forEach((c: any) => {
        suggestions.push({
          id: `cust-${c.id}`,
          type: 'customer',
          label: c.name,
          sublabel: c.companyName,
          href: `/crm/customers/${c.id}`,
        });
      });
    }

    // Lead name suggestions
    if (db.lead) {
      const leads = await db.lead.findMany({
        where: {
          companyId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, name: true, companyName: true },
      });

      leads.forEach((l: any) => {
        suggestions.push({
          id: `lead-${l.id}`,
          type: 'lead',
          label: l.name,
          sublabel: l.companyName,
          href: `/crm/leads/${l.id}`,
        });
      });
    }

    // Tag suggestions
    if (db.tag) {
      const tags = await db.tag.findMany({
        where: {
          companyId,
          name: { contains: query, mode: 'insensitive' },
        },
        take: 3,
        select: { id: true, name: true, color: true },
      });

      tags.forEach((t: any) => {
        suggestions.push({
          id: `tag-${t.id}`,
          type: 'tag',
          label: `#${t.name}`,
          sublabel: 'Workspace Tag',
          href: `/crm/search?q=${encodeURIComponent(t.name)}`,
        });
      });
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
  } catch (error) {
    console.error('[API GET /api/search/suggestions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve search suggestions.' },
      { status: 500 }
    );
  }
}
