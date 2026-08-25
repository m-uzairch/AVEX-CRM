import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { SmartInsightsEngine } from '@/features/ai/services/smart-insights-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;

    SmartInsightsEngine.dismissInsight(auth.companyId, id);

    return NextResponse.json({
      success: true,
      dismissedId: id,
      message: 'Insight dismissed successfully.',
    });
  } catch (error: any) {
    console.error('[API POST /api/ai/insights/[id]/dismiss] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dismiss insight.' },
      { status: 400 }
    );
  }
}
