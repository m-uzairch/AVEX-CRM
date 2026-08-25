# Sprint 06 - Task 001
# Settings Panel

Status: Completed
Priority: High

---

# Objective

Complete the AVEX CRM Settings Panel.

The current Settings section is incomplete. Before implementing new functionality, inspect the existing settings pages, components, APIs, database models, authentication/session system, RBAC system, company system, notification system, email configuration, and user profile system.

Reuse existing architecture wherever possible.

DO NOT create duplicate settings systems.

DO NOT replace working functionality unnecessarily.

---

# Important Implementation Rule

First perform an audit of the existing Settings implementation.

Inspect:

- Existing Settings routes
- Existing Settings components
- Existing API routes
- Existing Prisma models
- User model
- Company model
- Role/RBAC system
- Authentication/session system
- Notification preferences
- Email configuration
- Calendar configuration
- Existing environment variables
- Existing UI components

Identify what already works and what is incomplete.

Then implement/fix only what is necessary.

---

# Settings Structure

The Settings section should provide a clean navigation structure:

Settings
├── Profile
├── Account
├── Company
├── Users & Roles
├── Notifications
├── Email
├── Calendar
├── Security
└── CRM Preferences

Do not add unnecessary settings categories.

---

# 1. Profile Settings

Allow the authenticated user to view and update their own profile.

Fields:

- First Name
- Last Name
- Display Name
- Email
- Phone
- Profile Image where supported

Rules:

- Email must follow existing authentication rules.
- Do not allow a user to change their role from Profile settings.
- Do not allow a user to modify another user's profile.
- Reuse the existing user/session system.

---

# 2. Account Settings

Provide account-level preferences for the authenticated user.

Include where supported by the existing architecture:

- Language
- Timezone
- Date format
- Time format
- Default currency

Persist preferences in the database if the current schema supports user preferences.

If a suitable preference model does not exist, create a minimal reusable model rather than storing settings as random fields throughout unrelated models.

---

# 3. Company Settings

Company settings should only be accessible to authorized company administrators/owners.

Allow management of:

- Company Name
- Legal Name where applicable
- Company Email
- Phone
- Address
- City
- Country
- Website
- Logo
- Default Currency
- Tax information where already supported

Do not expose company settings to unauthorized employees.

Enforce authorization server-side.

---

# 4. Users & Roles

Create a settings section for managing company users.

Display:

- Name
- Email
- Role
- Status
- Created Date

Existing roles should be reused.

Do not invent a new role system.

Allow authorized administrators to:

- View users
- Invite users if invitation functionality already exists
- Activate/deactivate users where supported
- Assign permitted roles

Employees must not be able to escalate their own privileges.

A user must never be able to modify their own role through a manipulated request.

---

# 5. Notification Settings

Create notification preferences for the authenticated user.

Support existing notification channels where implemented:

- In-App
- Email

Provide preferences for important CRM events such as:

- New Lead
- Lead Assignment
- Customer Updates
- Task Assignment
- Project Updates
- Invoice Events
- Payment Events
- Client Requests
- Client Messages
- Meetings
- Attendance Events

Do not create a separate notification engine.

This page should configure the notification system that will be completed in Sprint 06 Task 003.

---

# 6. Email Settings

Create a clean email configuration/settings interface.

IMPORTANT:

Never expose:

- Resend API keys
- SMTP passwords
- API secrets
- JWT secrets
- Environment secrets

to the browser.

The existing Resend integration should remain server-side.

Display safe information such as:

- Email provider
- Sender name
- Sender address
- Email integration status

If administrator configuration is required, use secure server-side environment/configuration handling.

Do not store secrets in the frontend.

---

# 7. Calendar Settings

Provide calendar preferences that will be used by the Calendar system.

Include:

- Default calendar view
- Week start day
- Timezone
- Working hours
- Default event duration
- Meeting reminders

If Google Calendar integration is not yet implemented, do not create fake connection functionality.

Task 009 will handle external Google Calendar integration.

---

# 8. Security Settings

Create a security section.

Display safe account security information.

Support existing authentication capabilities such as:

- Change Password
- Active Session information where supported
- Logout from current session

If password change functionality does not exist, implement it using the existing authentication architecture.

Password rules:

- Never store plain-text passwords.
- Never return passwords from APIs.
- Never log passwords.
- Use the existing password hashing mechanism.

Do not implement unnecessary 2FA unless the existing architecture already supports it.

---

# 9. CRM Preferences

Provide organization/user preferences relevant to CRM behavior.

Where applicable:

- Default customer view
- Default lead view
- Default pipeline view
- Default invoice currency
- Default quotation currency
- Default page size
- Date format
- Number format

Do not duplicate existing database configuration.

---

# UI Requirements

The Settings UI should match the existing AVEX CRM design.

Use:

- Existing sidebar
- Existing cards
- Existing buttons
- Existing form components
- Existing input components
- Existing modal components
- Existing toast system

Do not introduce a new UI library.

Keep the interface simple and professional.

---

# Settings Navigation

Use a settings sidebar or tab navigation.

Example:

Settings

[ Profile ]
[ Account ]
[ Company ]
[ Users & Roles ]
[ Notifications ]
[ Email ]
[ Calendar ]
[ Security ]
[ CRM Preferences ]

The active section must be clearly visible.

---

# Forms

Every editable settings form must support:

- Initial loading state
- Saving state
- Success feedback
- Validation errors
- Server errors
- Cancel/reset behavior where appropriate

Prevent accidental duplicate submissions.

Disable the Save button while a save operation is in progress.

---

# API Requirements

Reuse existing APIs where possible.

If APIs are missing, create appropriately scoped endpoints.

Possible structure:

/api/settings/profile
/api/settings/account
/api/settings/company
/api/settings/users
/api/settings/notifications
/api/settings/email
/api/settings/calendar
/api/settings/security
/api/settings/crm

Do not blindly create these routes if equivalent existing routes already exist.

---

# Authorization

Authorization MUST be enforced server-side.

Examples:

Employee:

- Can update own profile.
- Can update own preferences.
- Cannot modify company settings.
- Cannot modify another user's account.
- Cannot assign themselves Admin/Owner privileges.

Company Owner/Admin:

- Can manage permitted company settings.
- Can manage users according to existing RBAC rules.
- Can manage company configuration.

Never trust:

- userId
- companyId
- role
- customerId

supplied by the client.

Resolve the authenticated user and company from the server-side session.

---

# Multi-Tenant Security

AVEX CRM is a multi-company SaaS.

Every company-level setting must belong to the authenticated user's company.

A user from Company A must never be able to access:

Company B settings.

Test this explicitly.

---

# Database

Before changing Prisma:

1. Inspect the existing schema.
2. Reuse existing models.
3. Avoid duplicate preference/settings tables.
4. Add migrations only when necessary.

If user preferences are missing, create a clean reusable structure.

Do not put unrelated settings into a single unstructured JSON field unless the existing architecture already follows that pattern.

---

# Environment Variables

Do not move secrets into database settings simply to make the Settings UI easier.

Keep sensitive configuration such as:

- RESEND_API_KEY
- JWT_SECRET
- NEXTAUTH_SECRET
- DATABASE_URL

server-side.

Never expose these through NEXT_PUBLIC_* variables.

---

# Error Handling

Handle:

- Unauthorized access
- Invalid settings
- Missing records
- Database failures
- Validation failures
- Permission failures

Return user-friendly errors.

Never expose:

- Prisma stack traces
- Database connection strings
- Environment variables
- API keys
- Internal stack traces

---

# Responsive Design

Settings must work on:

- Desktop
- Tablet
- Mobile

On mobile:

- Settings navigation must remain accessible.
- Forms must fit the viewport.
- No unnecessary horizontal scrolling.
- Buttons must remain usable.

---

# Testing

Test the following.

## Profile

1. Open Profile settings.
2. Update profile.
3. Save.
4. Refresh.
5. Verify persistence.

## Account

6. Change a user preference.
7. Refresh.
8. Verify persistence.

## Company

9. Login as authorized administrator.
10. Update company information.
11. Verify persistence.
12. Login as employee.
13. Verify unauthorized company settings are blocked.

## Users

14. View company users.
15. Verify roles.
16. Attempt unauthorized role modification.
17. Verify it is rejected.

## Notifications

18. Change notification preference.
19. Verify persistence.

## Email

20. Verify provider/sender information.
21. Verify secrets are not exposed to the browser.

## Calendar

22. Change calendar preferences.
23. Verify persistence.

## Security

24. Test password change if implemented.
25. Verify invalid password changes are rejected.

## Multi-Tenant

26. Attempt to access another company's settings using modified IDs.
27. Verify access is denied.

---

# Security Testing

Test ID manipulation.

Example:

```text
/api/settings/company?companyId=OTHER_COMPANY_ID