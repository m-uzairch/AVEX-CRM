# Sprint 06 - Task 009
# AI Automation & Proactive CRM Actions

Status: Completed
Priority: High

---

# Objective

Build the AI-powered automation layer for AVEX CRM.

This feature should allow AVEX to identify repetitive CRM tasks and prepare useful automated actions based on real CRM events.

IMPORTANT:

This task does NOT mean giving AI unrestricted control over the CRM.

The system must use controlled automation rules, explicit permissions, and confirmation requirements.

The initial implementation should focus on:

- Follow-up reminders
- Lead follow-up suggestions
- Quotation follow-up reminders
- Invoice follow-up reminders
- Project deadline reminders
- Task reminders
- Customer inactivity reminders
- AI-generated action recommendations

---

# IMPORTANT — AUDIT FIRST

Before implementing anything, inspect:

- Sprint 005 AI architecture
- Sprint 006 AI Document Extraction
- Sprint 006 AI CRM Assistant
- Sprint 006 Smart Insights
- Notification system
- Calendar system
- Task system
- Customer service
- Lead service
- Pipeline service
- Quotation service
- Invoice service
- Project service
- Background jobs
- Cron infrastructure
- Employee permissions
- RBAC
- Authentication
- Company/tenant architecture
- Existing email/Resend integration

Reuse existing systems.

DO NOT create duplicate:

- Notification systems
- Cron systems
- Email systems
- Task systems
- AI providers
- Permission systems

---

# Core Architecture

Use:

CRM Event/Data
      ↓
Automation Rules
      ↓
Eligibility Check
      ↓
Permission Check
      ↓
Automation Decision
      ↓
Optional AI Recommendation
      ↓
User Confirmation / Approved Automation
      ↓
Existing CRM Service
      ↓
Notification / Calendar / Email

---

# IMPORTANT SAFETY RULE

AI must NOT have unrestricted write access to AVEX CRM.

Do NOT allow AI to directly:

- Execute SQL
- Delete records
- Modify financial records
- Send mass emails
- Change payment status
- Change invoice amounts
- Change quotation totals
- Delete customers
- Delete leads
- Delete projects
- Change employee attendance

AI should recommend actions.

The application decides whether an action is allowed.

---

# Automation Types

Initially support:

## Lead Follow-Up

Detect:

- Lead has been inactive for configured number of days.
- Lead has no recent communication.
- Lead remains in an active pipeline stage.

Generate:

```text
Lead follow-up recommended