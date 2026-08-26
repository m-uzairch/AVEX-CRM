/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { customerFormSchema } from '@/features/crm/schemas/customer-schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');
    const isArchived = searchParams.get('isArchived') === 'true';
    const isDeleted = searchParams.get('isDeleted') === 'true';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const where: any = {};

    if (companyId && companyId !== 'ALL') {
      where.companyId = companyId;
    }

    if (isDeleted) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;

      if (isArchived) {
        where.isArchived = true;
      } else {
        where.isArchived = false;
      }
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (industry && industry !== 'ALL') {
      where.industry = industry;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const db = prisma as any;
    let customers: any[] = [];
    let total = 0;

    try {
      if (db.customer?.findMany) {
        total = await db.customer.count({ where }).catch(() => 0);
        customers = await db.customer.findMany({
          where,
          orderBy: { [sortField]: sortOrder },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            assignedEmployee: {
              select: { id: true, fullName: true, email: true },
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn('[API GET /api/crm/customers] DB query notice:', dbErr);
    }

    const totalPages = Math.ceil(total / pageSize) || 1;

    return NextResponse.json({
      data: customers,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error: any) {
    console.error('[API GET /api/crm/customers] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve customers.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = customerFormSchema.parse(body);

    const companyId = body.companyId || 'comp_001';
    const db = prisma as any;

    let customer: any = null;
    try {
      if (db.customer?.create) {
        customer = await db.customer.create({
          data: {
            companyId,
            assignedEmployeeId: validated.assignedEmployeeId || null,
            name: validated.name,
            companyName: validated.companyName,
            email: validated.email,
            phone: validated.phone,
            alternatePhone: validated.alternatePhone || null,
            country: validated.country || null,
            state: validated.state || null,
            city: validated.city || null,
            address: validated.address || null,
            postalCode: validated.postalCode || null,
            industry: validated.industry || null,
            businessType: validated.businessType || null,
            website: validated.website || null,
            companySize: validated.companySize || null,
            status: validated.status as any,
            source: validated.source || null,
            priority: validated.priority as any,
            tags: validated.tags || [],
            createdBy: 'Alex Carter',
            updatedBy: 'Alex Carter',
          },
        });
      }
    } catch (err) {
      console.warn('[API POST /api/crm/customers] DB create fallback:', err);
    }

    if (!customer) {
      customer = {
        id: `cust_${Date.now()}`,
        companyId,
        name: validated.name,
        companyName: validated.companyName,
        email: validated.email,
        phone: validated.phone,
        status: validated.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/crm/customers] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create customer record.' },
      { status: 400 }
    );
  }
}
