import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { AIAutomationExecutor } from '@/features/ai/services/ai-automation-executor';
import { executeAutomationSchema } from '@/features/ai/schemas/ai-automation-schemas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const validated = executeAutomationSchema.parse(body);

    const result = await AIAutomationExecutor.executeAction(
      auth.companyId,
      id,
      auth.userId,
      auth.fullName,
      validated
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/ai/automations/[id]/execute] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute automation.' },
      { status: 400 }
    );
  }
}
