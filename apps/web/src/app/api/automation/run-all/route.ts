/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { AutomationService } from '@/features/automation/services/automation-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const companyId = body.companyId || 'comp_001';

    const result = await AutomationService.runAllAutomations(companyId);

    return NextResponse.json({
      success: true,
      result,
      message: 'Master background automation completed successfully.',
    });
  } catch (error: any) {
    console.error('[API POST /api/automation/run-all] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to run master automation jobs.' },
      { status: 500 }
    );
  }
}
