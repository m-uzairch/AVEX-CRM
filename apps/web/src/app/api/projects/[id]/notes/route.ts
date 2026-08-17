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

    const notes = await db.projectNote.findMany({
      where: { projectId: id },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('[API GET /api/projects/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project notes.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const note = await db.projectNote.create({
      data: {
        projectId: id,
        companyId: project.companyId,
        content: body.content,
        isPinned: body.isPinned || false,
        createdById: body.createdById || 'usr_001',
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/projects/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create project note.' },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    const body = await request.json();
    const db = prisma as any;

    if (!noteId) {
      return NextResponse.json({ error: 'noteId parameter is required.' }, { status: 400 });
    }

    const updatedNote = await db.projectNote.update({
      where: { id: noteId, projectId: id },
      data: {
        content: body.content !== undefined ? body.content : undefined,
        isPinned: body.isPinned !== undefined ? body.isPinned : undefined,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ note: updatedNote });
  } catch (error: any) {
    console.error('[API PATCH /api/projects/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update project note.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    const db = prisma as any;

    if (!noteId) {
      return NextResponse.json({ error: 'noteId parameter is required.' }, { status: 400 });
    }

    await db.projectNote.delete({
      where: { id: noteId, projectId: id },
    });

    return NextResponse.json({ success: true, message: 'Note deleted.' });
  } catch (error) {
    console.error('[API DELETE /api/projects/[id]/notes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note.' },
      { status: 500 }
    );
  }
}
