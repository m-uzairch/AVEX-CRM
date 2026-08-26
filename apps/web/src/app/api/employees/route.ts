/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { EmployeeService } from '@/features/employees/services/employee-service';
import { employeeCreateSchema } from '@/features/employees/schemas/employee-schemas';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';

/**
 * GET /api/employees
 * List employees (Admin only, company-scoped)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can view the full employee directory
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can view the full employee directory.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const department = searchParams.get('department') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const result = await EmployeeService.getEmployees(auth.companyId, {
      search,
      department,
      status,
      page,
      pageSize,
      sortField,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API GET /api/employees] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch employees.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employees
 * Create employee (Admin only, company-scoped)
 * Returns the created record directly (no write-then-refetch pattern)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can create employees
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can add employees.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = employeeCreateSchema.parse(body);

    const employee = await EmployeeService.createEmployee(auth.companyId, validated);

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/employees] Error:', error);
    const isValidation = error?.name === 'ZodError';
    return NextResponse.json(
      { error: error?.message || 'Failed to create employee record.' },
      { status: isValidation ? 400 : 500 }
    );
  }
}
