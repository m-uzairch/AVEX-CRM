/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { folderFormSchema } from '@/features/files/schemas/file-schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = folderFormSchema.parse(body);
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id: validated.projectId },
      select: { id: true, companyId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const folder = await db.projectFolder.create({
      data: {
        companyId: project.companyId,
        projectId: validated.projectId,
        name: validated.name,
        parentId: validated.parentId || null,
        createdById: 'usr_001',
      },
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/files/folders] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create folder.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const db = prisma as any;

    if (!folderId) {
      return NextResponse.json({ error: 'folderId parameter is required.' }, { status: 400 });
    }

    await db.projectFolder.delete({
      where: { id: folderId },
    });

    return NextResponse.json({ success: true, message: 'Folder deleted.' });
  } catch (error) {
    console.error('[API DELETE /api/files/folders] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder.' },
      { status: 500 }
    );
  }
}
