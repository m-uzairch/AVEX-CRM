/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        assignedEmployee: {
          select: { id: true, fullName: true, email: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { fullName: true, email: true } },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('[API GET /api/crm/customers/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve customer details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    if (body.action === 'RESTORE') {
      const restored = await db.customer.update({
        where: { id },
        data: {
          deletedAt: null,
          updatedBy: 'Alex Carter',
        },
      });
      return NextResponse.json({ customer: restored });
    }

    const updated = await db.customer.update({
      where: { id },
      data: {
        ...body,
        updatedBy: 'Alex Carter',
      },
    });

    return NextResponse.json({ customer: updated });
  } catch (error: any) {
    console.error('[API PATCH /api/crm/customers/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update customer.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = prisma as any;

    const customer = await db.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: 'Alex Carter',
      },
    });

    return NextResponse.json({
      message: 'Customer moved to trash (soft deleted).',
      customer,
    });
  } catch (error) {
    console.error('[API DELETE /api/crm/customers/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer.' },
      { status: 500 }
    );
  }
}
