/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ProjectCompletionService } from '@/features/projects/services/project-completion-service';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const projectId = params.id;
    const body = await request.json().catch(() => ({}));

    const result = await ProjectCompletionService.archiveProject(
      projectId,
      body.companyId || 'comp_001',
      body.userId || 'usr_001',
      body.reason
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/projects/[id]/archive] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to archive project.' },
      { status: 500 }
    );
  }
}
