import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { AIService } from '@/features/ai/services/ai-service';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const aiService = new AIService();
    const status = await aiService.getStatus();

    return NextResponse.json({
      status,
      companyId: auth.companyId,
      userRole: auth.role,
      capabilities: [
        'LEAD_EXTRACTION',
        'CUSTOMER_EXTRACTION',
        'SMART_COLUMN_MAPPING',
        'ACTIVITY_SUMMARIZATION',
        'EMAIL_DRAFTING',
      ],
    });
  } catch (error: any) {
    console.error('[API GET /api/ai/status] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve AI provider status.' },
      { status: 500 }
    );
  }
}
