import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { AIAutomationEngine } from '@/features/ai/services/ai-automation-engine';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const items = await AIAutomationEngine.scanAndGenerate(auth.companyId);

    return NextResponse.json({
      success: true,
      totalProposals: items.length,
      message: `Scanned CRM workspace and generated ${items.length} automation proposals.`,
    });
  } catch (error: any) {
    console.error('[API POST /api/ai/automations/run-scan] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute automation scan.' },
      { status: 500 }
    );
  }
}
