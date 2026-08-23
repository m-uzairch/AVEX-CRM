# Sprint 05 - Task 002

# Client Authentication

Status: Completed

Priority: High

---

# Objective

Implement authentication for Client Portal users.

Clients should have a secure login system that is separate from the internal CRM experience while using the existing AVEX CRM authentication architecture where possible.

---

# Requirements

Implement:

- Client Login
- Client Logout
- Session Management
- Protected Client Routes
- Client Role Verification
- Unauthorized Access Handling

---

# Client Login

Create a client login page at:

/portal/login

The login form should contain:

- Email
- Password
- Login button

Validate:

- Required fields
- Valid email format
- Invalid credentials

Display clear error messages.

---

# Authentication

When a client logs in:

1. Verify credentials.
2. Verify the account exists.
3. Verify the user has the client role.
4. Verify the client account is active.
5. Create an authenticated session.
6. Redirect the client to:

/portal

Do not allow internal staff accounts to use the client portal as a client.

---

# Client Role

Use the existing AVEX CRM role/RBAC system where possible.

The client role should be clearly separated from:

- Admin
- Employee
- Other internal roles

Do not create a duplicate authentication system if the existing authentication architecture can support client users.

---

# Route Protection

Protect all Client Portal routes:

/portal

/portal/projects

/portal/projects/[id]

/portal/quotations

/portal/invoices

/portal/requests

/portal/meetings

/portal/files

/portal/profile

Unauthenticated users attempting to access these routes should be redirected to:

/portal/login

---

# Authorization

Authentication alone is not enough.

Every Client Portal request must verify:

- Authenticated user
- Client role
- Customer association
- Company association

A client must only be able to access records belonging to their own customer/company.

Do not trust IDs supplied by the client.

---

# Logout

Implement client logout.

After logout:

- Destroy/invalidate the session.
- Clear authentication cookies if applicable.
- Redirect to `/portal/login`.
- Prevent access to protected portal pages using browser back navigation.

---

# Session Handling

Use the existing AVEX CRM session/authentication system.

Do not introduce a second session mechanism unless absolutely necessary.

Ensure the session contains enough information to identify:

- User
- Role
- Customer
- Company

Do not store sensitive information unnecessarily in the client session.

---

# Unauthorized Access

Handle:

### Not Logged In

Redirect to:

/portal/login

### Logged In but Not a Client

Return an appropriate unauthorized response or redirect to the correct internal dashboard.

### Client Trying to Access Another Customer's Data

Return:

403 Forbidden

Do not reveal whether another customer's record exists.

---

# Security

Ensure:

- Passwords are never stored in plain text.
- Authentication cookies are secure.
- Server-side authorization is enforced.
- Client IDs cannot be manipulated to access another company.
- API routes perform authorization checks.
- Sensitive authentication information is never exposed to the frontend.

---

# UI

Create a clean Client Portal login page.

Keep it consistent with the existing AVEX CRM design.

Include:

- AVEX CRM branding
- Email field
- Password field
- Login button
- Loading state
- Error state

Do not add unnecessary animations or complex UI.

---

# Testing

Test:

1. Valid client login.
2. Invalid password.
3. Invalid email.
4. Non-existent account.
5. Internal employee attempting client login.
6. Unauthenticated access to `/portal`.
7. Client logout.
8. Access after logout.
9. Client attempting to access another customer's data.
10. Session persistence after page refresh.

---

# Deliverables

- Client login page
- Client authentication flow
- Client session handling
- Client role verification
- Protected portal routes
- Logout functionality
- Authorization checks
- Unauthorized access handling
- Basic authentication testing

---

# Acceptance Criteria

- A valid client can log in successfully.
- Invalid credentials are rejected.
- Only authorized client users can access the Client Portal.
- Protected portal routes require authentication.
- Clients cannot access internal CRM areas.
- Clients cannot access another company's/customer's data.
- Logout completely ends the client session.
- Authentication survives normal page refreshes.
- No existing internal authentication functionality is broken.
- No TypeScript errors.
- No console errors.
- Production build succeeds.

---

# Definition of Done

Client authentication is fully functional and securely connected to the existing AVEX CRM authentication and RBAC system.

Do not implement password reset, invitations, email verification, or advanced authentication features yet. Those can be added later if required.