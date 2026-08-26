/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { EmployeeService } from '@/features/employees/services/employee-service';
import { employeeUpdateSchema } from '@/features/employees/schemas/employee-schemas';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';

/**
 * GET /api/employees/[id]
 * Employee detail with assigned tasks and attendance summary
 * Accessible to Admin or self (if employee)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);
    const { id } = await params;

    const detail = await EmployeeService.getEmployeeById(auth.companyId, id);
    if (!detail) {
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
    }

    // RBAC: If EMPLOYEE role, only allow viewing their own profile
    if (auth.role === 'EMPLOYEE') {
      const isSelf =
        (detail.employee.userId && detail.employee.userId === auth.userId) ||
        detail.employee.email.toLowerCase() === auth.email.toLowerCase();

      if (!isSelf) {
        return NextResponse.json(
          { error: 'Access denied. You can only view your own employee profile.' },
          { status: 403 }
        );
      }
    } else if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to view this profile.' },
        { status: 403 }
      );
    }

    return NextResponse.json(detail);
  } catch (error: any) {
    console.error('[API GET /api/employees/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch employee details.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/employees/[id]
 * Update employee (Admin only, company-scoped)
 * Returns the updated record directly (no write-then-refetch pattern)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSettingsAuthContext(request);

    // RBAC: Only Admin / Company Owner can edit employee profiles
    if (auth.role !== 'COMPANY_OWNER' && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can modify employee records.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = employeeUpdateSchema.parse(body);

    const updated = await EmployeeService.updateEmployee(auth.companyId, id, validated);

    return NextResponse.json({ employee: updated });
  } catch (error: any) {
    console.error('[API PATCH /api/employees/[id]] Error:', error);
    const isValidation = error?.name === 'ZodError';
    return NextResponse.json(
      { error: error?.message || 'Failed to update employee.' },
      { status: isValidation ? 400 : 500 }
    );
  }
}
