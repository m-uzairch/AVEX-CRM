# Sprint 06 - Task 008
# AI Smart Insights Dashboard & Recommendations

Status: Completed
Priority: High

---

# Objective

Build the Smart Insights system for AVEX CRM.

This feature should proactively analyze the company's existing CRM data and surface useful business insights without requiring the user to ask the AI a question.

The goal is to answer:

"What needs my attention?"

Examples:

- Overdue invoices
- Stale leads
- High-value customers without recent activity
- Quotations waiting for follow-up
- Projects approaching deadlines
- Overdue tasks
- Unusual sales changes
- Pipeline changes
- Attendance anomalies where the user has permission
- Important business trends

The system must use real CRM data.

DO NOT generate fake insights.

DO NOT allow AI to invent numerical values.

---

# IMPORTANT — AUDIT FIRST

Before implementing anything, inspect:

- Task 005 AI architecture
- Task 007 AI Assistant
- Customer service
- Lead service
- Pipeline service
- Invoice service
- Quotation service
- Project service
- Task service
- Reports service
- Attendance service
- Notification service
- Dashboard
- Existing analytics
- Existing charts
- Existing RBAC
- Authentication/session system
- Company/tenant architecture
- Existing date utilities
- Existing background jobs

Reuse existing services.

DO NOT create duplicate business logic.

---

# Architecture

Use:

```text
CRM Data
   ↓
Insight Detection
   ↓
Deterministic Rules
   ↓
Optional AI Explanation
   ↓
Insight Validation
   ↓
Priority Calculation
   ↓
Smart Insights UI