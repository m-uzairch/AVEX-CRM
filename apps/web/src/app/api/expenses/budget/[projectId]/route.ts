/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ExpenseService } from '@/features/expenses/services/expense-service';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';

    const impact = await ExpenseService.getProjectBudgetImpact(params.projectId, companyId);
    return NextResponse.json({ impact });
  } catch (error: any) {
    console.error('[API GET /api/expenses/budget/[projectId]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch project budget impact.' },
      { status: 500 }
    );
  }
}
