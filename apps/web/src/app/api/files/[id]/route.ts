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

    const file = await db.projectFile.findUnique({
      where: { id },
      include: {
        folder: true,
        uploadedBy: {
          select: { id: true, fullName: true, email: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            uploadedBy: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('[API GET /api/files/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file details.' },
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

    const updatedFile = await db.projectFile.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        folderId: body.folderId !== undefined ? body.folderId : undefined,
        category: body.category !== undefined ? body.category : undefined,
        isClientVisible: body.isClientVisible !== undefined ? body.isClientVisible : undefined,
      },
      include: {
        folder: true,
        versions: true,
      },
    });

    return NextResponse.json({ file: updatedFile });
  } catch (error: any) {
    console.error('[API PATCH /api/files/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update file metadata.' },
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

    await db.projectFile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'File soft deleted.' });
  } catch (error) {
    console.error('[API DELETE /api/files/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file.' },
      { status: 500 }
    );
  }
}
