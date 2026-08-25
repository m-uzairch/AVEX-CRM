# Sprint 06 - Task 010
# Final Integration, QA, Security & Production Readiness

Status: Not Started
Priority: Critical

---

# Objective

Perform the final integration and production-readiness pass for AVEX CRM.

This task is NOT about adding a large new feature.

The goal is to verify that all systems built across Sprints 1–6 work together correctly, fix integration problems, remove technical debt discovered during testing, and ensure AVEX CRM is safe to run in a production environment.

Do not redesign the application.

Do not replace working architecture.

Do not introduce unnecessary libraries.

Do not rewrite functioning modules.

Fix actual issues found during the audit.

---

# IMPORTANT — FULL SYSTEM AUDIT FIRST

Before changing code, inspect the entire project.

Review:

- Sprint 001
- Sprint 002
- Sprint 003
- Sprint 004
- Sprint 005
- Sprint 006

Especially verify:

- Authentication
- RBAC
- Multi-tenancy
- CRM
- Customers
- Leads
- Pipeline
- Projects
- Tasks
- Calendar
- Notifications
- Settings
- Attendance
- Invoices
- Quotations
- Payments
- Expenses
- Financial Reports
- Client Portal
- Resend Email
- AI Document Extraction
- AI CRM Assistant
- AI Smart Insights
- AI Automations
- Background Jobs
- Cron Jobs

---

# DO NOT TRUST PREVIOUS AUDITS

Previous audits identified issues such as:

- Missing DATABASE_URL
- JWT fallback secret
- Invoice persistence problems
- Quotation persistence problems
- PDF generation failures
- Email configuration issues
- Payment persistence problems
- Expense foreign-key issues
- Unprotected cron endpoints
- Client portal scope issues
- Financial report indexing
- Mobile table overflow

Verify whether each issue is actually fixed.

Do not assume a previous agent's claim that something is fixed is correct.

---

# Phase 1 — Application Health

Start the application using the normal AVEX development command.

Verify:

- Application starts successfully.
- No startup exceptions.
- No fatal warnings.
- No hydration errors.
- No missing environment configuration errors.
- No repeated server crashes.
- No infinite request loops.

Inspect browser console.

There should be no unexpected:

```text
ERROR
Unhandled Promise Rejection
Hydration mismatch
Failed to fetch
500 Internal Server Error