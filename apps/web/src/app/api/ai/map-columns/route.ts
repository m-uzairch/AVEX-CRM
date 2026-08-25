import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { columnMappingRequestSchema } from '@/features/ai/schemas/column-mapping-schema';
import { AIService } from '@/features/ai/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    const body = await request.json().catch(() => ({}));
    const validated = columnMappingRequestSchema.parse(body);

    const aiService = new AIService();
    const result = await aiService.mapColumns(
      validated.headers,
      validated.targetEntity,
      validated.sampleRows
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/ai/map-columns] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to map columns.' },
      { status: 400 }
    );
  }
}
