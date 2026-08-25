import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { AIInsightsService } from '@/features/ai/services/ai-insights-service';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const insights = await AIInsightsService.generateInsights(auth.companyId);

    return NextResponse.json({
      insights,
      companyId: auth.companyId,
      total: insights.length,
    });
  } catch (error: any) {
    console.error('[API GET /api/ai/assistant/insights] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate smart insights.' },
      { status: 500 }
    );
  }
}
