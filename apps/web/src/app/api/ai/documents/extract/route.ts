import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { AIExtractionPipeline } from '@/features/ai/services/ai-extraction-pipeline';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetEntity = ((formData.get('targetEntity') as string) || 'LEAD').toUpperCase() as 'LEAD' | 'CUSTOMER';

    if (!file) {
      return NextResponse.json({ error: 'No document or spreadsheet file provided.' }, { status: 400 });
    }

    // Size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum allowed size of 10MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await AIExtractionPipeline.processDocument(
      buffer,
      file.name,
      targetEntity,
      auth.companyId,
      file.type
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/ai/documents/extract] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process and extract document.' },
      { status: 500 }
    );
  }
}
