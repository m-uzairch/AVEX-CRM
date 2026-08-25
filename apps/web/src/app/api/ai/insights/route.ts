import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { SmartInsightsEngine } from '@/features/ai/services/smart-insights-engine';
import { insightFilterSchema } from '@/features/ai/schemas/smart-insights-schemas';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { searchParams } = new URL(request.url);

    const rawCategory = searchParams.get('category') || 'ALL';
    const rawPriority = searchParams.get('priority') || 'ALL';
    const search = searchParams.get('search') || '';

    const filters = insightFilterSchema.parse({
      category: rawCategory.toUpperCase(),
      priority: rawPriority.toUpperCase(),
      search,
    });

    const result = await SmartInsightsEngine.evaluateInsights(auth.companyId, filters);

    return NextResponse.json({
      ...result,
      companyId: auth.companyId,
    });
  } catch (error: any) {
    console.error('[API GET /api/ai/insights] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to evaluate smart insights.' },
      { status: 500 }
    );
  }
}
