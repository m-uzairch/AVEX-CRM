import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { confirmDocumentImportSchema } from '@/features/ai/schemas/document-extraction-schema';
import { AIImportExecutionService } from '@/features/ai/services/ai-import-execution-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = confirmDocumentImportSchema.parse(body);

    const result = await AIImportExecutionService.executeImport(
      validated.items,
      validated.targetEntity,
      auth.companyId,
      auth.userId,
      auth.fullName,
      validated.deadlinesToSync
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/ai/documents/confirm-import] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute import.' },
      { status: 400 }
    );
  }
}
