/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ExpenseService } from '@/features/expenses/services/expense-service';

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const expense = await ExpenseService.getExpenseById(params.id);
    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error('[API GET /api/expenses/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Expense record not found.' },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const result = await ExpenseService.softDeleteExpense(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API DELETE /api/expenses/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to soft delete expense.' },
      { status: 400 }
    );
  }
}
