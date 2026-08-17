/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ProjectCompletionService } from '@/features/projects/services/project-completion-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const projects = await ProjectCompletionService.getArchivedProjects(companyId);

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('[API GET /api/projects/archived] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch archived projects.' },
      { status: 500 }
    );
  }
}
