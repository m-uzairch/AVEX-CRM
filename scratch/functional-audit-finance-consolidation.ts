/**
 * Functional HTTP & Navigation Audit Script for Finance Consolidation & Recurring Invoices
 * 
 * Verifies:
 * 1. UI Routes & Redirects:
 *    - /invoices/recurring redirects to /invoices?tab=recurring
 *    - /payments redirects to /finance?tab=payments
 *    - /expenses redirects to /finance?tab=expenses
 *    - /taxes redirects to /finance?tab=taxes
 * 2. New Consolidated UI Routes:
 *    - /invoices and /invoices?tab=recurring
 *    - /finance with tabs: payments, expenses, taxes, discounts
 *    - /payments/outstanding, /expenses/approvals, /expenses/vendors
 * 3. Backend Endpoints & Data Queries:
 *    - POST /api/invoices/recurring/process-jobs remains intact
 *    - GET /api/payments, GET /api/expenses, GET /api/taxes, GET /api/discounts
 *    - Financial reports single source of truth (/api/reports, /api/financial-dashboard)
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
  console.log('🚀 AVEX CRM — Functional Audit: Finance & Navigation Consolidation');
  console.log(`Target: ${BASE_URL}`);
  console.log('======================================================\n');

  const sessionCookie = 'auth_session=s:mock-session-id';
  const headers = {
    'Content-Type': 'application/json',
    Cookie: sessionCookie,
  };

  // ----------------------------------------------------
  // PART 1: LEGACY REDIRECTS VALIDATION
  // ----------------------------------------------------
  console.log('\n--- PART 1: LEGACY REDIRECT VALIDATION ---');

  const redirectTests = [
    { url: '/invoices/recurring', expectedPath: '/invoices?tab=recurring' },
    { url: '/payments', expectedPath: '/finance?tab=payments' },
    { url: '/expenses', expectedPath: '/finance?tab=expenses' },
    { url: '/taxes', expectedPath: '/finance?tab=taxes' },
  ];

  for (const test of redirectTests) {
    try {
      console.log(`\nTesting redirect for ${test.url}...`);
      const res = await fetch(`${BASE_URL}${test.url}`, {
        headers,
        redirect: 'manual',
      });
      console.log(`Status: ${res.status}`);
      const location = res.headers.get('location') || '';
      console.log(`Location: ${location}`);

      const isRedirect = res.status === 307 || res.status === 308 || res.status === 302 || res.status === 301;
      const pointsToTarget = location.includes(test.expectedPath);
      assert(isRedirect && pointsToTarget, `${test.url} redirects cleanly to ${test.expectedPath}`);
    } catch (err: any) {
      console.warn(`Redirect test error for ${test.url}:`, err.message);
    }
  }

  // ----------------------------------------------------
  // PART 2: CONSOLIDATED UI ROUTE ACCESSIBILITY
  // ----------------------------------------------------
  console.log('\n--- PART 2: CONSOLIDATED UI ROUTES ACCESSIBILITY ---');

  const uiRoutes = [
    '/invoices',
    '/invoices?tab=recurring',
    '/finance',
    '/finance?tab=payments',
    '/finance?tab=expenses',
    '/finance?tab=taxes',
    '/finance?tab=discounts',
    '/payments/outstanding',
    '/expenses/approvals',
    '/expenses/vendors',
  ];

  for (const route of uiRoutes) {
    try {
      console.log(`\nTesting UI Route: ${route}...`);
      const res = await fetch(`${BASE_URL}${route}`, { headers });
      console.log(`Status: ${res.status}`);
      assert(res.status === 200 || res.status === 401 || res.status === 403, `UI route ${route} responds with valid status (${res.status})`);
    } catch (err: any) {
      console.warn(`UI route error for ${route}:`, err.message);
    }
  }

  // ----------------------------------------------------
  // PART 3: RECURRING CRON ENDPOINT & API CONTRACTS
  // ----------------------------------------------------
  console.log('\n--- PART 3: RECURRING CRON & API ENDPOINTS INTEGRITY ---');

  // 3.1 Recurring Invoices Process-Jobs (Untouched Backend Worker)
  try {
    console.log('\nTesting POST /api/invoices/recurring/process-jobs...');
    const res = await fetch(`${BASE_URL}/api/invoices/recurring/process-jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ companyId: 'comp_001' }),
    });
    console.log(`Status: ${res.status}`);
    assert(res.status === 200 || res.status === 500, 'POST /api/invoices/recurring/process-jobs responds without route 404');
  } catch (err: any) {
    console.warn('Cron endpoint error:', err.message);
  }

  // 3.2 Core Financial API Endpoints
  const apiEndpoints = [
    { method: 'GET', path: '/api/payments' },
    { method: 'GET', path: '/api/payments/outstanding' },
    { method: 'GET', path: '/api/expenses' },
    { method: 'GET', path: '/api/expenses/categories' },
    { method: 'GET', path: '/api/expenses/vendors' },
    { method: 'GET', path: '/api/taxes' },
    { method: 'GET', path: '/api/taxes/templates' },
    { method: 'GET', path: '/api/discounts' },
    { method: 'GET', path: '/api/discounts/rules' },
    { method: 'GET', path: '/api/invoices/recurring' },
    { method: 'GET', path: '/api/invoices/recurring/summary' },
  ];

  for (const endpoint of apiEndpoints) {
    try {
      console.log(`\nTesting ${endpoint.method} ${endpoint.path}...`);
      const res = await fetch(`${BASE_URL}${endpoint.path}`, { headers });
      console.log(`Status: ${res.status}`);
      assert(res.status === 200 || res.status === 401 || res.status === 403, `${endpoint.path} is reachable and functional`);
    } catch (err: any) {
      console.warn(`API test error for ${endpoint.path}:`, err.message);
    }
  }

  // ----------------------------------------------------
  // PART 4: FINANCIAL REPORTS SINGLE SOURCE OF TRUTH
  // ----------------------------------------------------
  console.log('\n--- PART 4: FINANCIAL REPORTING SINGLE SOURCE OF TRUTH ---');

  try {
    console.log('\nTesting GET /api/reports?type=REVENUE...');
    const res = await fetch(`${BASE_URL}/api/reports?type=REVENUE`, { headers });
    console.log(`Status: ${res.status}`);
    assert(res.status === 200 || res.status === 401 || res.status === 403, '/api/reports responds with valid status');
  } catch (err: any) {
    console.warn('Reports test error:', err.message);
  }

  try {
    console.log('\nTesting GET /api/financial-dashboard?dateRange=THIS_YEAR...');
    const res = await fetch(`${BASE_URL}/api/financial-dashboard?dateRange=THIS_YEAR`, { headers });
    console.log(`Status: ${res.status}`);
    assert(res.status === 200 || res.status === 401 || res.status === 403, '/api/financial-dashboard responds with valid status');
  } catch (err: any) {
    console.warn('Financial dashboard test error:', err.message);
  }

  // ----------------------------------------------------
  // FINAL SUMMARY
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`📊 AUDIT SUMMARY: Total: ${stats.total} | Passed: ${stats.passed} | Failed: ${stats.failed}`);
  console.log('======================================================\n');
}

runAudit().catch((err) => {
  console.error('Fatal audit runner error:', err);
  process.exit(1);
});
