/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { Customer } from '@/features/crm/types/customer-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerIds, format = 'csv' } = body;
    const db = prisma as any;

    const where: any = { deletedAt: null };
    if (Array.isArray(customerIds) && customerIds.length > 0) {
      where.id = { in: customerIds };
    }

    const customers: Customer[] = await db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Customer Name',
      'Company Name',
      'Email',
      'Phone',
      'Industry',
      'Status',
      'Priority',
      'Tags',
      'Created Date',
    ];

    const rows = customers.map((c: Customer) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.companyName.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.industry || ''}"`,
      `"${c.status}"`,
      `"${c.priority}"`,
      `"${(c.tags || []).join('; ')}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="AVEX_CRM_Customers_${Date.now()}.${format === 'csv' ? 'csv' : 'csv'}"`,
      },
    });
  } catch (error) {
    console.error('[API POST /api/crm/customers/export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export customers.' },
      { status: 500 }
    );
  }
}
