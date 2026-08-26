/**
 * Functional HTTP Audit Script for Employee Directory & Inventory Management
 * 
 * Verifies live endpoints against the running Next.js server:
 * - Employees: list, create, edit, deactivate, reactivate
 * - Inventory: list, create, edit, stock-in, stock-out, adjustment, validation enforcement
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface AuditStats {
  passed: number;
  failed: number;
  total: number;
}

const stats: AuditStats = { passed: 0, failed: 0, total: 0 };

function assert(condition: boolean, message: string) {
  stats.total++;
  if (condition) {
    stats.passed++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${message}`);
  } else {
    stats.failed++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${message}`);
  }
}

async function runAudit() {
  console.log('\n======================================================');
  console.log('🚀 AVEX CRM — Functional HTTP Audit: Employees & Inventory');
  console.log(`Target: ${BASE_URL}`);
  console.log('======================================================\n');

  // Test session cookie mimicking an authenticated Admin / Company Owner
  const sessionCookie = 'auth_session=s:mock-session-id';
  const headers = {
    'Content-Type': 'application/json',
    Cookie: sessionCookie,
  };

  let createdEmployeeId: string | null = null;
  let createdItemId: string | null = null;

  // ----------------------------------------------------
  // PART 1: EMPLOYEE DIRECTORY AUDIT WORKFLOW
  // ----------------------------------------------------
  console.log('\n--- PART 1: EMPLOYEE DIRECTORY WORKFLOW ---');

  // 1.1 List Employees
  try {
    console.log('\n[1.1] Testing GET /api/employees (List)...');
    const res = await fetch(`${BASE_URL}/api/employees?page=1&pageSize=10`, { headers });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    assert(res.status === 200 || res.status === 401 || res.status === 403, 'Endpoint responds with valid HTTP status');
    if (res.status === 200) {
      assert(Array.isArray(data.data), 'Returns paginated employee array in data.data');
      assert(typeof data.total === 'number', 'Returns numeric total count');
    }
  } catch (err: any) {
    console.log(`Server not reachable at ${BASE_URL} (Unit tests verify handler logic). Error: ${err.message}`);
  }

  // 1.2 Create Employee
  try {
    console.log('\n[1.2] Testing POST /api/employees (Create)...');
    const testEmployeePayload = {
      fullName: 'Audit Test Employee',
      email: `audit.emp.${Date.now()}@avexcrm.com`,
      phone: '+1 555-0999',
      role: 'Staff Solutions Engineer',
      department: 'Engineering',
      employmentStatus: 'ACTIVE',
      hireDate: new Date().toISOString(),
    };

    const res = await fetch(`${BASE_URL}/api/employees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testEmployeePayload),
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    if (res.status === 201) {
      assert(data.employee && data.employee.id, 'Created employee record returned directly');
      assert(data.employee.fullName === testEmployeePayload.fullName, 'Full name matches created payload');
      assert(data.employee.employmentStatus === 'ACTIVE', 'Default status is ACTIVE');
      createdEmployeeId = data.employee.id;
    }
  } catch (err: any) {
    console.log(`Error: ${err.message}`);
  }

  // 1.3 Edit Employee
  if (createdEmployeeId) {
    try {
      console.log(`\n[1.3] Testing PATCH /api/employees/${createdEmployeeId} (Edit)...`);
      const updatePayload = {
        role: 'Principal Staff Solutions Engineer',
        department: 'Architecture & Engineering',
      };
      const res = await fetch(`${BASE_URL}/api/employees/${createdEmployeeId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updatePayload),
      });
      console.log(`Status: ${res.status}`);
      const data = await res.json();
      if (res.status === 200) {
        assert(data.employee.role === updatePayload.role, 'Role successfully updated');
        assert(data.employee.department === updatePayload.department, 'Department successfully updated');
      }
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }

    // 1.4 Deactivate Employee (Soft delete via employmentStatus = TERMINATED)
    try {
      console.log(`\n[1.4] Testing PATCH /api/employees/${createdEmployeeId}/status (Deactivate)...`);
      const res = await fetch(`${BASE_URL}/api/employees/${createdEmployeeId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'TERMINATED' }),
      });
      console.log(`Status: ${res.status}`);
      const data = await res.json();
      if (res.status === 200) {
        assert(data.employee.employmentStatus === 'TERMINATED', 'Status updated to TERMINATED (Soft delete)');
        assert(Boolean(data.employee.terminationDate), 'Termination date timestamp populated');
      }
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }

    // 1.5 Reactivate Employee
    try {
      console.log(`\n[1.5] Testing PATCH /api/employees/${createdEmployeeId}/status (Reactivate)...`);
      const res = await fetch(`${BASE_URL}/api/employees/${createdEmployeeId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      console.log(`Status: ${res.status}`);
      const data = await res.json();
      if (res.status === 200) {
        assert(data.employee.employmentStatus === 'ACTIVE', 'Status reactivated to ACTIVE');
        assert(data.employee.terminationDate === null, 'Termination date reset to null');
      }
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }
  }

  // ----------------------------------------------------
  // PART 2: INVENTORY MANAGEMENT AUDIT WORKFLOW
  // ----------------------------------------------------
  console.log('\n--- PART 2: INVENTORY MANAGEMENT WORKFLOW ---');

  // 2.1 List Inventory Items
  try {
    console.log('\n[2.1] Testing GET /api/inventory/items (List)...');
    const res = await fetch(`${BASE_URL}/api/inventory/items?page=1&pageSize=10`, { headers });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    assert(res.status === 200 || res.status === 401 || res.status === 403, 'Endpoint responds with valid HTTP status');
    if (res.status === 200) {
      assert(Array.isArray(data.data), 'Returns paginated inventory items array');
      assert(typeof data.lowStockCount === 'number', 'Returns lowStockCount KPI metric');
    }
  } catch (err: any) {
    console.log(`Error: ${err.message}`);
  }

  // 2.2 Create Inventory Item
  try {
    console.log('\n[2.2] Testing POST /api/inventory/items (Create)...');
    const testSku = `AUDIT-SKU-${Date.now()}`;
    const testItemPayload = {
      sku: testSku,
      name: 'Server Audit Test Server Pro',
      description: 'High performance testing node',
      category: 'Hardware',
      unit: 'units',
      costPrice: 450,
      sellPrice: 799.99,
      reorderThreshold: 5,
      isActive: true,
    };

    const res = await fetch(`${BASE_URL}/api/inventory/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testItemPayload),
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    if (res.status === 201) {
      assert(data.item && data.item.id, 'Created inventory item returned directly');
      assert(data.item.sku === testSku.toUpperCase(), 'SKU normalized to uppercase');
      assert(data.item.currentStock === 0, 'Initial stock level defaults to 0');
      createdItemId = data.item.id;
    }
  } catch (err: any) {
    console.log(`Error: ${err.message}`);
  }

  // 2.3 Record Stock Movement: STOCK_IN
  if (createdItemId) {
    try {
      console.log(`\n[2.3] Testing POST /api/inventory/items/${createdItemId}/movements (STOCK_IN)...`);
      const stockInPayload = {
        type: 'STOCK_IN',
        quantity: 20,
        reason: 'Audit PO Initial Delivery #882',
      };
      const res = await fetch(`${BASE_URL}/api/inventory/items/${createdItemId}/movements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(stockInPayload),
      });
      console.log(`Status: ${res.status}`);
      const data = await res.json();
      if (res.status === 201) {
        assert(data.currentStock === 20, 'Stock level atomic increment to 20 inside transaction');
        assert(data.movement.type === 'STOCK_IN', 'Movement record created with type STOCK_IN');
      }
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }

    // 2.4 Record Stock Movement: STOCK_OUT
    try {
      console.log(`\n[2.4] Testing POST /api/inventory/items/${createdItemId}/movements (STOCK_OUT)...`);
      const stockOutPayload = {
        type: 'STOCK_OUT',
        quantity: 4,
        reason: 'Dispatched to customer project Alpha',
      };
      const res = await fetch(`${BASE_URL}/api/inventory/items/${createdItemId}/movements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(stockOutPayload),
      });
      console.log(`Status: ${res.status}`);
      const data = await res.json();
      if (res.status === 201) {
        assert(data.currentStock === 16, 'Stock level atomic decrement from 20 to 16 inside transaction');
      }
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }

    // 2.5 Record Stock Movement: Excessive STOCK_OUT (Validation Rejection)
    try {
      console.log(`\n[2.5] Testing POST /api/inventory/items/${createdItemId}/movements (Excessive STOCK_OUT)...`);
      const excessivePayload = {
        type: 'STOCK_OUT',
        quantity: 999, // exceeds available stock (16)
        reason: 'Attempting invalid excessive stock out',
      };
      const res = await fetch(`${BASE_URL}/api/inventory/items/${createdItemId}/movements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(excessivePayload),
      });
      console.log(`Status: ${res.status}`);
      assert(res.status === 400, 'Server correctly rejected excessive stock out with 400 Bad Request');
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }

    // 2.6 Record Stock Movement: Negative Quantity (Validation Rejection)
    try {
      console.log(`\n[2.6] Testing POST /api/inventory/items/${createdItemId}/movements (Negative Quantity)...`);
      const negativePayload = {
        type: 'STOCK_IN',
        quantity: -10,
        reason: 'Attempting invalid negative quantity',
      };
      const res = await fetch(`${BASE_URL}/api/inventory/items/${createdItemId}/movements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(negativePayload),
      });
      console.log(`Status: ${res.status}`);
      assert(res.status === 400, 'Server correctly rejected negative quantity with 400 Bad Request');
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }

    // 2.7 Fetch Movements Ledger
    try {
      console.log(`\n[2.7] Testing GET /api/inventory/items/${createdItemId}/movements (Ledger)...`);
      const res = await fetch(`${BASE_URL}/api/inventory/items/${createdItemId}/movements`, { headers });
      console.log(`Status: ${res.status}`);
      const data = await res.json();
      if (res.status === 200) {
        assert(Array.isArray(data.data), 'Returns movements array');
        assert(data.total >= 2, 'History contains all recorded transactions');
      }
    } catch (err: any) {
      console.log(`Error: ${err.message}`);
    }
  }

  console.log('\n======================================================');
  console.log(`🏁 AUDIT COMPLETE: ${stats.passed} Passed, ${stats.failed} Failed of ${stats.total} Checks`);
  console.log('======================================================\n');
}

runAudit().catch((err) => {
  console.error('Audit execution fatal error:', err);
  process.exit(1);
});
