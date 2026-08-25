import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { rawDocumentInputSchema } from '@/features/ai/schemas/extraction-schema';
import { AIService } from '@/features/ai/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    const body = await request.json().catch(() => ({}));
    const validated = rawDocumentInputSchema.parse(body);

    const aiService = new AIService();
    const result = await aiService.extractCustomers(validated.content, validated.instructions);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/ai/extract/customer] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to extract customer from document.' },
      { status: 400 }
    );
  }
}
