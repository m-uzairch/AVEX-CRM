/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { PaymentTrackingService } from '@/features/payments/services/payment-tracking-service';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const summary = await PaymentTrackingService.getProjectPaymentSummary(
      params.projectId,
      companyId
    );

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('[API GET /api/payments/summary/project/[projectId]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch project payment summary.' },
      { status: 500 }
    );
  }
}
