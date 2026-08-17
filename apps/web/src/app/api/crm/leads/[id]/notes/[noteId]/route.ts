/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id, noteId } = await params;
    const db = prisma as any;

    const note = await db.leadNote.findUnique({
      where: { id: noteId },
    });

    if (!note || note.leadId !== id) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

    await db.leadNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true, message: 'Note deleted.' });
  } catch (error) {
    console.error('[API DELETE /api/crm/leads/[id]/notes/[noteId]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note.' },
      { status: 500 }
    );
  }
}
