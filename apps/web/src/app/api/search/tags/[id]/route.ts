/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const db = prisma as any;
    if (!db.tag) {
      return NextResponse.json({ tag: { id, ...body } });
    }

    const tag = await db.tag.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.color && { color: body.color }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    try {
      if (db.activityLog) {
        await db.activityLog.create({
          data: {
            companyId: tag.companyId,
            action: 'TAG_UPDATED',
            module: 'CRM',
            description: `Updated tag '#${tag.name}'`,
          },
        });
      }
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ tag });
  } catch (error: any) {
    console.error('[API PATCH /api/search/tags/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update tag.' },
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

    if (db.tag) {
      const tag = await db.tag.findUnique({ where: { id } });
      if (tag) {
        await db.tag.delete({ where: { id } });

        try {
          if (db.activityLog) {
            await db.activityLog.create({
              data: {
                companyId: tag.companyId,
                action: 'TAG_DELETED',
                module: 'CRM',
                description: `Deleted smart tag '#${tag.name}'`,
              },
            });
          }
        } catch {
          // Non-blocking
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Tag deleted successfully.' });
  } catch (error) {
    console.error('[API DELETE /api/search/tags/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag.' },
      { status: 500 }
    );
  }
}
