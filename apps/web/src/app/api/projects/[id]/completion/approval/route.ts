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
    const body = await request.json();

    const result = await ProjectCompletionService.submitClientApproval(
      projectId,
      body.companyId || 'comp_001',
      {
        status: body.status,
        feedback: body.feedback,
        changesNeeded: body.changesNeeded,
        userId: body.userId,
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/projects/[id]/completion/approval] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit delivery approval.' },
      { status: 400 }
    );
  }
}
