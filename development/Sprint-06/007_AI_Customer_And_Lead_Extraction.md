# Sprint 06 - Task 007
# AI CRM Assistant & Smart Insights

Status: Completed
Priority: High

---

# Objective

Build the first user-facing AI assistant for AVEX CRM.

The AI assistant should help users understand and work with their CRM data without replacing the existing CRM functionality.

The assistant should be able to answer questions such as:

- How many leads do we have?
- Which leads need attention?
- What were our sales this month?
- Which invoices are overdue?
- Which customers are high value?
- What is our pipeline looking like?
- Which projects are currently delayed?
- Give me a summary of this month's business activity.
- Show me customers who have not been contacted recently.

The assistant must use real AVEX CRM data.

DO NOT create fake/demo answers.

---

# IMPORTANT — AUDIT FIRST

Before implementation, inspect:

- AI architecture from Task 005
- AI provider configuration
- Customer service
- Lead service
- Pipeline service
- Invoice service
- Quotation service
- Project service
- Task service
- Reports service
- Employee service
- Attendance service
- Notification service
- Authentication/session system
- RBAC system
- Company/tenant system
- Existing dashboard APIs
- Existing analytics APIs
- Existing search functionality

Determine which APIs/services already expose the required data.

Reuse existing services instead of duplicating database queries.

---

# Architecture

The assistant should follow:

User
 ↓
AI Assistant UI
 ↓
Assistant API
 ↓
Authentication
 ↓
RBAC
 ↓
CRM Context Builder
 ↓
AI Service
 ↓
AI Provider
 ↓
Structured Response
 ↓
UI

The AI must NOT directly query Prisma.

Instead:

AI Assistant
    ↓
CRM Context Service
    ↓
Existing CRM Services
    ↓
Database

---

# Critical Rule

The AI must never be allowed to generate arbitrary database queries.

DO NOT allow the model to produce:

```sql
SELECT ...
UPDATE ...
DELETE ...
DROP ...