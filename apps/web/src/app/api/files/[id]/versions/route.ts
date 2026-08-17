/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const file = await db.projectFile.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    const newVersionNumber = file.currentVersion + 1;

    const version = await db.fileVersion.create({
      data: {
        fileId: id,
        versionNumber: newVersionNumber,
        fileUrl: body.fileUrl || file.fileUrl,
        fileSize: body.fileSize || file.fileSize,
        changeNotes: body.changeNotes || `Version ${newVersionNumber} update`,
        uploadedById: 'usr_001',
      },
    });

    // Update current version and size on main ProjectFile record
    await db.projectFile.update({
      where: { id },
      data: {
        currentVersion: newVersionNumber,
        fileUrl: body.fileUrl || file.fileUrl,
        fileSize: body.fileSize || file.fileSize,
      },
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/files/[id]/versions] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload new version.' },
      { status: 400 }
    );
  }
}
