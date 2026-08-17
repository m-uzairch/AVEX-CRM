/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { TaxService } from '@/features/taxes/services/tax-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const userId = body.userId || 'usr_001';
    const templateId = body.templateId;

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
    }

    const result = await TaxService.setDefaultTemplate(companyId, userId, templateId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API POST /api/taxes/templates/default] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to set default tax template.' },
      { status: 400 }
    );
  }
}
