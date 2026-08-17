/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { ExpenseService } from '@/features/expenses/services/expense-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'comp_001';
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;
    const vendorId = searchParams.get('vendorId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;

    const result = await ExpenseService.getExpenseList(companyId, {
      search,
      categoryId,
      status,
      vendorId,
      projectId,
      employeeId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API GET /api/expenses] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch expenses list.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.companyId || 'comp_001';
    const createdById = body.createdById || 'usr_001';

    const expense = await ExpenseService.createExpense(companyId, createdById, body);

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/expenses] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record expense.' },
      { status: 400 }
    );
  }
}
