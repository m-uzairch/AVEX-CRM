/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const db = prisma as any;
    const where: any = { deletedAt: null };

    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const leads = db.lead
      ? await db.lead.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            assignedEmployee: { select: { fullName: true, email: true } },
          },
        })
      : [];

    if (format === 'json' || format === 'excel') {
      return new NextResponse(JSON.stringify(leads, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="leads-export-${Date.now()}.json"`,
        },
      });
    }

    // CSV format output
    const headers = [
      'ID',
      'Name',
      'Company Name',
      'Email',
      'Phone',
      'Source',
      'Status',
      'Priority',
      'Score',
      'Assigned Employee',
      'Expected Value',
      'Tags',
      'Created At',
    ];

    const rows = leads.map((l: any) => [
      `"${l.id}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.companyName || '').replace(/"/g, '""')}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.source || ''}"`,
      `"${l.status || ''}"`,
      `"${l.priority || ''}"`,
      l.score ?? 50,
      `"${l.assignedEmployee?.fullName || 'Unassigned'}"`,
      l.expectedDealValue ?? 0,
      `"${(l.tags || []).join('; ')}"`,
      `"${new Date(l.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('[API GET /api/crm/leads/export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export leads data.' },
      { status: 500 }
    );
  }
}
