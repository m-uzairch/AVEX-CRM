/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const folderId = searchParams.get('folderId');
    const category = searchParams.get('category');
    const isClientVisible = searchParams.get('isClientVisible');
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required.' }, { status: 400 });
    }

    const db = prisma as any;

    const folderWhere: any = { projectId };
    if (folderId === 'ROOT') {
      folderWhere.parentId = null;
    } else if (folderId && folderId !== 'ALL') {
      folderWhere.parentId = folderId;
    }

    const fileWhere: any = { projectId, deletedAt: null };
    if (folderId === 'ROOT') {
      fileWhere.folderId = null;
    } else if (folderId && folderId !== 'ALL') {
      fileWhere.folderId = folderId;
    }

    if (category && category !== 'ALL') {
      fileWhere.category = category;
    }

    if (isClientVisible === 'true') {
      fileWhere.isClientVisible = true;
    }

    if (search) {
      fileWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [folders, files, allFiles] = await Promise.all([
      db.projectFolder.findMany({
        where: folderWhere,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { files: true, children: true } },
        },
      }),
      db.projectFile.findMany({
        where: fileWhere,
        orderBy: { [sortField]: sortOrder },
        include: {
          folder: true,
          uploadedBy: {
            select: { id: true, fullName: true, email: true },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
          },
        },
      }),
      db.projectFile.findMany({
        where: { projectId, deletedAt: null },
        select: { fileSize: true, category: true },
      }),
    ]);

    // Calculate Storage Summary
    const totalBytesUsed = allFiles.reduce((acc: number, f: any) => acc + (f.fileSize || 0), 0);
    const formattedStorageUsed =
      totalBytesUsed > 1024 * 1024 * 1024
        ? `${(totalBytesUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`
        : totalBytesUsed > 1024 * 1024
        ? `${(totalBytesUsed / (1024 * 1024)).toFixed(2)} MB`
        : `${(totalBytesUsed / 1024).toFixed(1)} KB`;

    const categoryBreakdown: Record<string, number> = {};
    allFiles.forEach((f: any) => {
      categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + (f.fileSize || 0);
    });

    const storageSummary = {
      totalBytesUsed,
      formattedStorageUsed,
      totalFilesCount: allFiles.length,
      totalFoldersCount: folders.length,
      categoryBreakdown,
    };

    return NextResponse.json({
      folders,
      files,
      storageSummary,
    });
  } catch (error) {
    console.error('[API GET /api/files] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project files.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id: body.projectId },
      select: { id: true, companyId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const file = await db.projectFile.create({
      data: {
        companyId: project.companyId,
        projectId: body.projectId,
        folderId: body.folderId || null,
        name: body.name,
        originalName: body.originalName || body.name,
        fileUrl: body.fileUrl || '/demo-file.pdf',
        fileSize: body.fileSize || 1024 * 500, // 500 KB default
        fileType: body.fileType || 'application/pdf',
        category: body.category || 'DOCUMENTS',
        isClientVisible: body.isClientVisible || false,
        currentVersion: 1,
        uploadedById: 'usr_001',
        versions: {
          create: {
            versionNumber: 1,
            fileUrl: body.fileUrl || '/demo-file.pdf',
            fileSize: body.fileSize || 1024 * 500,
            changeNotes: 'Initial file upload',
            uploadedById: 'usr_001',
          },
        },
      },
      include: {
        folder: true,
        versions: true,
      },
    });

    // Audit Activity
    try {
      await db.activityLog.create({
        data: {
          companyId: project.companyId,
          action: 'FILE_UPLOADED',
          module: 'PROJECTS',
          category: 'DOCUMENT_MANAGEMENT',
          entityType: 'PROJECT',
          entityId: body.projectId,
          description: `Uploaded file "${file.name}" (${(file.fileSize / 1024).toFixed(1)} KB)`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({ file }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/files] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file.' },
      { status: 400 }
    );
  }
}
