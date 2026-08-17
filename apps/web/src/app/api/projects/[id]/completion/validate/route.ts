/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ProjectCompletionService } from '@/features/projects/services/project-completion-service';

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const projectId = params.id;
    const validation = await ProjectCompletionService.validateCompletion(projectId);

    return NextResponse.json(validation);
  } catch (error: any) {
    console.error('[API GET /api/projects/[id]/completion/validate] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to validate project completion.' },
      { status: 500 }
    );
  }
}
