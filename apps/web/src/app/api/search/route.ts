/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const moduleFilter = searchParams.get('module') || 'all';

    if (!query.trim()) {
      return NextResponse.json({
        query: '',
        totalCount: 0,
        customers: [],
        leads: [],
      });
    }

    const companyId = 'comp_001';
    const userId = 'usr_001';
    const db = prisma as any;

    let customers: any[] = [];
    let leads: any[] = [];

    // Search Customers if requested
    if ((moduleFilter === 'all' || moduleFilter === 'customers') && db.customer) {
      const dbCustomers = await db.customer.findMany({
        where: {
          companyId,
          deletedAt: null,
          isArchived: false,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 20,
      });

      customers = dbCustomers.map((c: any) => ({
        id: c.id,
        module: 'customers' as const,
        title: c.name,
        subtitle: c.companyName,
        email: c.email,
        phone: c.phone,
        status: c.status,
        priority: c.priority,
        tags: c.tags || [],
        href: `/crm/customers/${c.id}`,
      }));
    }

    // Search Leads if requested
    if ((moduleFilter === 'all' || moduleFilter === 'leads') && db.lead) {
      const dbLeads = await db.lead.findMany({
        where: {
          companyId,
          deletedAt: null,
          isArchived: false,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
            { source: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 20,
      });

      leads = dbLeads.map((l: any) => ({
        id: l.id,
        module: 'leads' as const,
        title: l.name,
        subtitle: l.companyName,
        email: l.email,
        phone: l.phone,
        status: l.status,
        priority: l.priority,
        score: l.score,
        tags: l.tags || [],
        href: `/crm/leads/${l.id}`,
      }));
    }

    // Record term in RecentSearch history log
    if (query.trim().length >= 3 && db.recentSearch) {
      try {
        await db.recentSearch.create({
          data: {
            companyId,
            userId,
            query: query.trim(),
          },
        });
      } catch {
        // Non-blocking
      }
    }

    const totalCount = customers.length + leads.length;

    return NextResponse.json({
      query,
      totalCount,
      customers,
      leads,
    });
  } catch (error) {
    console.error('[API GET /api/search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute global search.' },
      { status: 500 }
    );
  }
}
