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

    const result = await ProjectCompletionService.restoreProject(
      projectId,
      body.companyId || 'comp_001',
      body.userId || 'usr_001'
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/projects/[id]/restore] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to restore project.' },
      { status: 500 }
    );
  }
}
