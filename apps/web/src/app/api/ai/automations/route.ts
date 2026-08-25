import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { AIAutomationEngine } from '@/features/ai/services/ai-automation-engine';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const result = await AIAutomationEngine.getQueue(auth.companyId);

    return NextResponse.json({
      ...result,
      companyId: auth.companyId,
    });
  } catch (error: any) {
    console.error('[API GET /api/ai/automations] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch automations queue.' },
      { status: 500 }
    );
  }
}
