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

    const delivery = await ProjectCompletionService.deliverProject(
      projectId,
      body.companyId || 'comp_001',
      {
        deliveredById: body.deliveredById || 'usr_001',
        deliveryNotes: body.deliveryNotes,
        deliveryFiles: body.deliveryFiles,
      }
    );

    return NextResponse.json({ delivery }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/projects/[id]/completion/deliver] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit project delivery.' },
      { status: 400 }
    );
  }
}
