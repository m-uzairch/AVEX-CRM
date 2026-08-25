# Sprint 06 - Task 004
# Attendance System

Status: Completed
Priority: Critical

---

# Objective

Audit, repair, and complete the existing AVEX CRM Employee Attendance system.

The Attendance feature was implemented in a previous sprint but is currently NOT working correctly.

The goal is NOT to create a completely new attendance system.

First inspect the existing implementation and determine why it is failing. Reuse the existing architecture, database models, APIs, authentication, RBAC, employee system, notifications, and UI wherever possible.

The final result must be a reliable attendance system with proper database persistence, employee access control, administrator visibility, and accurate attendance calculations.

---

# IMPORTANT — AUDIT FIRST

Before changing code, inspect the entire existing Attendance implementation.

Inspect:

- Attendance pages
- Attendance components
- Attendance services
- Attendance API routes
- Prisma schema
- Attendance database models
- Employee model
- User model
- Company model
- Authentication/session system
- RBAC system
- Notification system
- Settings/timezone system
- Dashboard widgets
- Existing attendance calculations
- Existing reports
- Existing migrations
- Existing seed/test data

Determine:

1. What currently works.
2. What currently fails.
3. Whether the database model is correct.
4. Whether API routes work.
5. Whether authentication is correctly identifying the employee.
6. Whether company scoping is correct.
7. Whether clock-in persistence works.
8. Whether clock-out persistence works.
9. Whether attendance calculations are correct.
10. Whether the UI is calling the correct endpoints.

DO NOT rewrite the entire feature without first identifying the actual failure.

---

# Attendance Architecture

The expected flow is:

Employee
    ↓
Attendance Page
    ↓
Clock In / Clock Out
    ↓
Authenticated API
    ↓
Attendance Service
    ↓
Prisma
    ↓
PostgreSQL
    ↓
Attendance Record
    ↓
Dashboard / History / Reports

All attendance actions must use the authenticated server-side user.

Do not trust employeeId or userId supplied by the browser.

---

# Attendance Records

Inspect the existing Prisma schema before modifying it.

If an appropriate Attendance model already exists, reuse it.

A suitable attendance record may contain:

- id
- companyId
- employeeId
- date
- clockIn
- clockOut
- status
- notes
- createdAt
- updatedAt

Use the existing AVEX naming conventions.

Do not create duplicate Attendance models.

---

# Employee Relationship

Attendance must be connected to the actual Employee record.

Determine how the existing system maps:

User → Employee → Company

Reuse that relationship.

If the authenticated user does not have an employee record:

Return a clear error such as:

"Employee profile not found."

Do NOT allow the client to submit an arbitrary employeeId to bypass this.

---

# Multi-Tenant Security

AVEX CRM is a multi-company SaaS.

Every attendance query must be scoped to the authenticated user's company.

Company A must never see Company B attendance records.

Do not trust:

- companyId
- employeeId
- userId

from the frontend.

Resolve these from the authenticated session and server-side relationships.

---

# Employee Attendance Page

The employee should have access to their own attendance information.

The page should display:

- Today's status
- Clock-in time
- Clock-out time
- Total working time
- Current attendance status
- Attendance history

Example:

Today's Attendance

Status: Present

Clock In:
09:04 AM

Clock Out:
05:31 PM

Working Time:
8h 27m

---

# Clock In

Provide a clear:

```text
Clock In