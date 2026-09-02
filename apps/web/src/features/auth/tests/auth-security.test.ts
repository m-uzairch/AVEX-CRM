import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { POST as loginCRMHandler } from '@/app/api/auth/login/route';
import { POST as loginPortalHandler } from '@/app/api/portal/auth/login/route';
import { GET as getPortalAuthMeHandler } from '@/app/api/portal/auth/me/route';
import { getPortalAuthContext } from '@/features/portal/services/portal-auth-helper';
import { UserManagementService } from '@/features/rbac/services/user-management-service';

import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as settingsUsersHandler } from '@/app/api/settings/users/route';

function createMockRequest(url: string, options: { method?: string; body?: any; cookies?: Record<string, string> } = {}) {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method || 'GET',
    headers: {
      'content-type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.cookies) {
    for (const [key, value] of Object.entries(options.cookies)) {
      req.cookies.set(key, value);
    }
  }

  return req;
}

describe('CRITICAL SECURITY: Authentication Bypass & Portal Gate Test Suite', () => {
  describe('1. Constant-Time Password Hashing & Verification', () => {
    it('generates salted PBKDF2 hash and verifies correctly', () => {
      const password = 'SuperSecretPassword2026!';
      const hash = hashPassword(password);

      expect(hash).toContain(':');
      const [salt, key] = hash.split(':');
      expect(salt.length).toBe(32); // 16 bytes in hex
      expect(key.length).toBe(128); // 64 bytes in hex

      expect(verifyPassword(password, hash)).toBe(true);
      expect(verifyPassword('WrongPassword!', hash)).toBe(false);
    });

    it('rejects unhashed, malformed, empty or mismatched hashes', () => {
      expect(verifyPassword('Password123!', 'hashed_pwd')).toBe(false);
      expect(verifyPassword('Password123!', 'hashed_client_pwd')).toBe(false);
      expect(verifyPassword('Password123!', '')).toBe(false);
      expect(verifyPassword('', 'some:hash')).toBe(false);
      expect(verifyPassword('Password123!', 'invalidhashwithoutcolon')).toBe(false);
    });
  });

  describe('2. Main CRM Login API (Positive & Negative Role Tests)', () => {
    it('successfully authenticates COMPANY_OWNER with valid credentials', async () => {
      const req = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'admin@avexcrm.com',
          password: 'Password123!',
        },
      });

      const res = await loginCRMHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.user).toBeDefined();
      expect(json.user.email).toBe('admin@avexcrm.com');
      expect(json.user.role).toBe('COMPANY_OWNER');
    });

    it('successfully authenticates ADMIN with valid credentials', async () => {
      const req = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'sarah@avexcrm.com',
          password: 'Password123!',
        },
      });

      const res = await loginCRMHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.user.email).toBe('sarah@avexcrm.com');
      expect(json.user.role).toBe('ADMIN');
    });

    it('successfully authenticates EMPLOYEE with valid credentials and preserves EMPLOYEE role', async () => {
      const req = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'marcus@avexcrm.com',
          password: 'Password123!',
        },
      });

      const res = await loginCRMHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.user.email).toBe('marcus@avexcrm.com');
      expect(json.user.role).toBe('EMPLOYEE');
    });

    it('REJECTS login with incorrect password and returns generic 401 error', async () => {
      const req = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'admin@avexcrm.com',
          password: 'IncorrectPassword999!',
        },
      });

      const res = await loginCRMHandler(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toBe('Invalid email or password.');
    });

    it('REJECTS login for unregistered email and returns generic 401 error (No Bypass)', async () => {
      const req = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'nonexistent_hacker_user@unknown-domain.com',
          password: 'AnyPassword123!',
        },
      });

      const res = await loginCRMHandler(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toBe('Invalid email or password.');
    });
  });

  describe('3. Client Portal Authentication & Route Gate Tests', () => {
    it('successfully authenticates CLIENT with valid credentials and sets client_session', async () => {
      const req = createMockRequest('/api/portal/auth/login', {
        method: 'POST',
        body: {
          email: 'client@nexuscorp.com',
          password: 'Password123!',
        },
      });

      const res = await loginPortalHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.client).toBeDefined();
      expect(json.client.email).toBe('client@nexuscorp.com');
    });

    it('REJECTS client portal login for internal staff account with 403', async () => {
      const req = createMockRequest('/api/portal/auth/login', {
        method: 'POST',
        body: {
          email: 'admin@avexcrm.com',
          password: 'Password123!',
        },
      });

      const res = await loginPortalHandler(req);
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json.error).toContain('internal staff account');
    });

    it('REJECTS client portal login with incorrect password with 401', async () => {
      const req = createMockRequest('/api/portal/auth/login', {
        method: 'POST',
        body: {
          email: 'client@nexuscorp.com',
          password: 'WrongPassword!',
        },
      });

      const res = await loginPortalHandler(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toBe('Invalid email or password.');
    });

    it('REJECTS unauthenticated GET /api/portal/auth/me with 401 without demo fallback', async () => {
      const req = createMockRequest('/api/portal/auth/me', {
        method: 'GET',
      });

      const res = await getPortalAuthMeHandler(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toContain('Client session not found');
    });

    it('getPortalAuthContext returns null when no client session cookie is provided', async () => {
      const req = createMockRequest('/api/portal/dashboard', {
        method: 'GET',
      });

      const context = await getPortalAuthContext(req);
      expect(context).toBeNull();
    });

    it('getPortalAuthContext returns client context when valid client session cookie is provided', async () => {
      const req = createMockRequest('/api/portal/dashboard', {
        method: 'GET',
        cookies: {
          client_session: 'client_demo_1',
        },
      });

      const context = await getPortalAuthContext(req);
      expect(context).not.toBeNull();
      expect(context?.customerId).toBe('cust_001');
      expect(context?.clientEmail).toBe('client@nexuscorp.com');
    });
  });

  describe('4. Employee Credential Creation & Immediate Sign-In Verification', () => {
    it('creates employee account with password and allows immediate sign-in as EMPLOYEE', async () => {
      const employeeEmail = `new.engineer.${Date.now()}@avexcrm.com`;
      const employeePassword = 'CustomSecurePassword123!';

      // 1. Invite/Create Employee in User Management
      const invited = await UserManagementService.inviteUser({
        fullName: 'David Robinson',
        email: employeeEmail,
        role: 'EMPLOYEE',
        password: employeePassword,
      });

      expect(invited.email).toBe(employeeEmail);
      expect(invited.role).toBe('EMPLOYEE');

      // 2. Attempt login with correct credentials -> MUST SUCCEED as EMPLOYEE
      const loginReq = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: employeeEmail,
          password: employeePassword,
        },
      });

      const loginRes = await loginCRMHandler(loginReq);
      expect(loginRes.status).toBe(200);

      const loginJson = await loginRes.json();
      expect(loginJson.user.email).toBe(employeeEmail);
      expect(loginJson.user.role).toBe('EMPLOYEE');

      // 3. Attempt login with wrong password -> MUST FAIL with 401
      const wrongReq = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: employeeEmail,
          password: 'IncorrectPassword!',
        },
      });

      const wrongRes = await loginCRMHandler(wrongReq);
      expect(wrongRes.status).toBe(401);
    });
  });

  describe('5. User Registration & Immediate Workspace Login', () => {
    it('allows a new user to register a company workspace and immediately log in with their details', async () => {
      const regEmail = `owner.${Date.now()}@newstartup.io`;
      const regPassword = 'MySecretStartupPassword123!';

      // 1. Register new account
      const regReq = createMockRequest('/api/auth/register', {
        method: 'POST',
        body: {
          fullName: 'Jordan Bell',
          companyName: 'Horizon Labs Inc.',
          businessType: 'DIGITAL',
          email: regEmail,
          password: regPassword,
          confirmPassword: regPassword,
        },
      });

      const regRes = await registerHandler(regReq);
      expect(regRes.status).toBe(200);

      const regJson = await regRes.json();
      expect(regJson.user.email).toBe(regEmail);
      expect(regJson.user.role).toBe('COMPANY_OWNER');

      // 2. Sign in with the newly registered credentials
      const loginReq = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: regEmail,
          password: regPassword,
        },
      });

      const loginRes = await loginCRMHandler(loginReq);
      expect(loginRes.status).toBe(200);

      const loginJson = await loginRes.json();
      expect(loginJson.user.email).toBe(regEmail);
      expect(loginJson.user.role).toBe('COMPANY_OWNER');
    });

    it('successfully handles Supabase pre-authenticated payload in login route', async () => {
      const suEmail = `supabase.user.${Date.now()}@cloud.io`;
      const suReq = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: suEmail,
          password: 'Password123!',
          supabaseUser: {
            id: `usr_sb_${Date.now()}`,
            email: suEmail,
            user_metadata: {
              full_name: 'Supabase User',
              company_name: 'Supabase Workspace',
              businessType: 'DIGITAL',
              role: 'COMPANY_OWNER',
            },
          },
        },
      });

      const suRes = await loginCRMHandler(suReq);
      expect(suRes.status).toBe(200);

      const suJson = await suRes.json();
      expect(suJson.user.email).toBe(suEmail);
      expect(suJson.user.role).toBe('COMPANY_OWNER');
    });
  });

  describe('6. Created Employee & Client Account Sign-In Verification (via /api/settings/users)', () => {
    it('creates an EMPLOYEE account with custom password in User Management and allows immediate sign-in at /api/auth/login', async () => {
      const empEmail = `created.emp.${Date.now()}@avexcrm.com`;
      const empPassword = 'EmpCustomPassword789!';

      // 1. Admin creates employee via Settings Users API
      const createReq = createMockRequest('/api/settings/users', {
        method: 'POST',
        body: {
          fullName: 'Alice Walker',
          email: empEmail,
          role: 'EMPLOYEE',
          password: empPassword,
        },
      });

      const createRes = await settingsUsersHandler(createReq);
      expect(createRes.status).toBe(201);

      // 2. Employee signs in with their assigned email & password
      const loginReq = createMockRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: empEmail,
          password: empPassword,
        },
      });

      const loginRes = await loginCRMHandler(loginReq);
      expect(loginRes.status).toBe(200);

      const loginJson = await loginRes.json();
      expect(loginJson.user.email).toBe(empEmail);
      expect(loginJson.user.role).toBe('EMPLOYEE');
      expect(loginJson.user.fullName).toBe('Alice Walker');
    });

    it('creates a CLIENT account with custom password in User Management and allows immediate sign-in at /api/portal/auth/login', async () => {
      const clientEmail = `created.client.${Date.now()}@acmepartner.com`;
      const clientPassword = 'ClientSecurePassword456!';

      // 1. Admin creates client account via Settings Users API
      const createReq = createMockRequest('/api/settings/users', {
        method: 'POST',
        body: {
          fullName: 'Robert Vance',
          email: clientEmail,
          role: 'CLIENT',
          password: clientPassword,
        },
      });

      const createRes = await settingsUsersHandler(createReq);
      expect(createRes.status).toBe(201);

      // 2. Client signs in to Client Portal with their assigned email & password
      const loginReq = createMockRequest('/api/portal/auth/login', {
        method: 'POST',
        body: {
          email: clientEmail,
          password: clientPassword,
        },
      });

      const loginRes = await loginPortalHandler(loginReq);
      expect(loginRes.status).toBe(200);

      const loginJson = await loginRes.json();
      expect(loginJson.client.email).toBe(clientEmail);
      expect(loginJson.client.name).toBe('Robert Vance');
      expect(loginRes.cookies.get('client_session')).toBeDefined();
    });
  });
});
