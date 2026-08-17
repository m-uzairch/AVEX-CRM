/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { QuotationService } from '@/features/quotations/services/quotation-service';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();

    const quotation = await QuotationService.submitClientResponse(
      params.id,
      body.status,
      body.feedback
    );

    return NextResponse.json({ quotation });
  } catch (error: any) {
    console.error('[API POST /api/quotations/[id]/response] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit client response.' },
      { status: 400 }
    );
  }
}
