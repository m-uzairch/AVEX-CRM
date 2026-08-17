/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { TaxService } from '@/features/taxes/services/tax-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const templates = await TaxService.getTemplates(companyId);
    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('[API GET /api/taxes/templates] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch tax templates.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const userId = body.userId || 'usr_001';

    const template = await TaxService.createTemplate(companyId, userId, body);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/taxes/templates] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create tax template.' },
      { status: 400 }
    );
  }
}
