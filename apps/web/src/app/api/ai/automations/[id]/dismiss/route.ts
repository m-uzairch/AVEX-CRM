import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { AIAutomationExecutor } from '@/features/ai/services/ai-automation-executor';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;

    const dismissed = AIAutomationExecutor.dismissAction(auth.companyId, id);

    return NextResponse.json({
      success: dismissed,
      dismissedId: id,
      message: 'Automation proposal dismissed.',
    });
  } catch (error: any) {
    console.error('[API POST /api/ai/automations/[id]/dismiss] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dismiss automation.' },
      { status: 400 }
    );
  }
}
