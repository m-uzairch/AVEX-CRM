/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ExpenseService } from '@/features/expenses/services/expense-service';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const reviewerId = body.reviewerId || 'usr_001';

    const expense = await ExpenseService.approveRejectExpense(
      params.id,
      reviewerId,
      body.status,
      body.approvalNotes
    );

    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error('[API POST /api/expenses/[id]/approval] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process expense approval.' },
      { status: 400 }
    );
  }
}
